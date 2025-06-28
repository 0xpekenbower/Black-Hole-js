#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');

// Configuration constants
const CONFIG = {
  elasticsearch: {
    url: process.env.ES_URL || 'http://elasticsearch:9200',
    username: 'elastic',
    password: process.env.ELASTIC_PASSWORD
  },
  paths: {
    config: path.resolve(__dirname, '..', 'config'),
    get logstashRole() { return path.join(this.config, 'logstash_writer.json') },
    get filebeatRole() { return path.join(this.config, 'filebeat_writer.json') },
    get indexesDir() { return path.join(this.config, 'indexes') }
  },
  credentials: {
    kibana: process.env.KIBANA_SYSTEM_PASSWORD,
    logstash: process.env.LOGSTASH_INTERNAL_PASSWORD,
    filebeat: process.env.FILEBEAT_INTERNAL_PASSWORD
  },
  retryInterval: 5000, // 5 seconds
  maxRetries: 60 // 5 minutes total
};

// Validate required environment variables
const REQUIRED_ENV_VARS = [
  'ELASTIC_PASSWORD', 
  'KIBANA_SYSTEM_PASSWORD', 
  'LOGSTASH_INTERNAL_PASSWORD', 
  'FILEBEAT_INTERNAL_PASSWORD'
];

for (const varName of REQUIRED_ENV_VARS) {
  if (!process.env[varName]) {
    console.error(`❌ Error: Missing environment variable ${varName}`);
    process.exit(1);
  }
}

/**
 * Create an axios instance for Elasticsearch API
 * @returns {Object} Axios instance
 */
const createApiClient = () => {
  return axios.create({
    baseURL: CONFIG.elasticsearch.url,
    auth: {
      username: CONFIG.elasticsearch.username,
      password: CONFIG.elasticsearch.password
    },
    headers: { 'Content-Type': 'application/json' },
    validateStatus: () => true // Don't throw on non-2xx responses
  });
};

/**
 * Wait for Elasticsearch to be ready
 * @returns {Promise<void>}
 */
async function waitForES() {
  console.log('Waiting for Elasticsearch to be ready...');
  const apiClient = createApiClient();
  
  for (let i = 0; i < CONFIG.maxRetries; i++) {
    try {
      const res = await apiClient.get('/');
      if (res.status === 200) {
        console.log('✅ Elasticsearch is ready!');
        return;
      }
      console.log(`⏳ Elasticsearch returned status ${res.status}, waiting...`);
    } catch (error) {
      console.log('⏳ Elasticsearch not ready yet:', error.message);
    }
    await new Promise(resolve => setTimeout(resolve, CONFIG.retryInterval));
  }
  throw new Error('❌ Elasticsearch did not become ready in time');
}

/**
 * Set the Kibana system user password
 * @returns {Promise<void>}
 */
async function setKibanaPassword() {
  const apiClient = createApiClient();
  console.log('Setting Kibana system user password...');
  
  const res = await apiClient.post('/_security/user/kibana_system/_password', {
    password: CONFIG.credentials.kibana
  });
  
  if (res.status !== 200) {
    throw new Error('❌ Failed to update password for kibana_system');
  }
  
  console.log('✅ Kibana system password updated successfully');
}

/**
 * Create a role in Elasticsearch
 * @param {string} roleName - Name of the role to create
 * @param {string} roleFilePath - Path to the role definition file
 * @returns {Promise<void>}
 */
async function createRole(roleName, roleFilePath) {
  const apiClient = createApiClient();
  console.log(`Creating role: ${roleName}...`);
  
  try {
    const data = await fs.readFile(roleFilePath, 'utf8');
    const res = await apiClient.post(`/_security/role/${roleName}`, JSON.parse(data));
    
    if (res.status !== 200) {
      throw new Error(`Failed to create role ${roleName}`);
    }
    
    console.log(`✅ Role created: ${roleName}`);
  } catch (error) {
    console.error(`❌ Error creating role ${roleName}:`, error.message);
    throw error;
  }
}

/**
 * Create or update a user in Elasticsearch
 * @param {string} username - Username to create/update
 * @param {string} password - Password for the user
 * @param {Array<string>} roles - Roles to assign to the user
 * @returns {Promise<void>}
 */
async function createOrUpdateUser(username, password, roles) {
  const apiClient = createApiClient();
  console.log(`Setting up user: ${username}...`);
  
  try {
    // Check if user exists
    const checkRes = await apiClient.get(`/_security/user/${username}`);
    
    if (checkRes.status === 200) {
      // Update existing user's password
      const updateRes = await apiClient.post(`/_security/user/${username}/_password`, {
        password: password
      });
      
      if (updateRes.status !== 200) {
        throw new Error(`Failed to update password for ${username}`);
      }
      
      console.log(`✅ Updated password for existing user: ${username}`);
    } else {
      // Create new user
      const createRes = await apiClient.post(`/_security/user/${username}`, {
        password: password,
        roles: roles
      });
      
      if (createRes.status !== 200) {
        throw new Error(`Failed to create user ${username}`);
      }
      
      console.log(`✅ Created new user: ${username}`);
    }
  } catch (error) {
    console.error(`❌ Error setting up user ${username}:`, error.message);
    throw error;
  }
}

/**
 * Create ILM policy for gateway logs
 * @returns {Promise<void>}
 */
async function createILMPolicy() {
  const apiClient = createApiClient();
  const policyName = "gateway-logs-policy";
  
  console.log(`Creating ILM policy: ${policyName}...`);
  
  const policyContent = {
    phases: {
      hot: {
        min_age: "0ms",
        actions: {
          rollover: {
            max_age: "7d",
            max_size: "10gb"
          },
          set_priority: {
            priority: 100
          }
        }
      },
      warm: {
        min_age: "30d",
        actions: {
          shrink: {
            number_of_shards: 1
          },
          forcemerge: {
            max_num_segments: 1
          },
          set_priority: {
            priority: 50
          }
        }
      },
      cold: {
        min_age: "60d",
        actions: {
          set_priority: {
            priority: 0
          }
        }
      },
      delete: {
        min_age: "90d",
        actions: {
          delete: {}
        }
      }
    }
  };

  try {
    const policyRes = await apiClient.put(`/_ilm/policy/${policyName}`, { policy: policyContent });
    
    if (policyRes.status !== 200) {
      console.error('❌ Policy creation error:', JSON.stringify(policyRes.data, null, 2));
      throw new Error('Failed to create ILM policy');
    }
    
    console.log(`✅ Created ILM policy: ${policyName}`);
  } catch (error) {
    console.error('❌ Error creating ILM policy:', error.message);
    throw error;
  }
}

/**
 * Install index templates from configuration files
 * @returns {Promise<void>}
 */
async function installIndexTemplates() {
  const apiClient = createApiClient();
  console.log("Starting index templates setup...");
  
  await createILMPolicy();
  
  try {
    const files = await fs.readdir(CONFIG.paths.indexesDir);
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const templateName = path.basename(file, '.json');
      console.log(`Processing index template from file: ${file}`);
      
      try {
        const templateData = await fs.readFile(path.join(CONFIG.paths.indexesDir, file), 'utf8');
        const templateContent = JSON.parse(templateData);
        
        const templateRes = await apiClient.put(`/_index_template/${templateName}`, templateContent);
        
        if (templateRes.status !== 200) {
          console.error(`❌ Template creation error for ${templateName}:`, JSON.stringify(templateRes.data, null, 2));
          throw new Error(`Failed to create index template ${templateName}`);
        }
        
        console.log(`✅ Created index template from file: ${templateName}`);
      } catch (error) {
        console.error(`❌ Error processing template ${file}:`, error.message);
        throw error;
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('ℹ️ No indexes directory found, skipping custom index templates');
    } else {
      console.error('❌ Error processing index templates:', err.message);
      throw err;
    }
  }
}

/**
 * Main function to set up Elasticsearch
 * @returns {Promise<void>}
 */
async function setupElasticsearch() {
  try {
    await waitForES();
    
    // Set up users and roles
    await setKibanaPassword();
    await createRole('logstash_writer', CONFIG.paths.logstashRole);
    await createOrUpdateUser('logstash_internal', CONFIG.credentials.logstash, ['logstash_writer']);
    await createRole('filebeat_writer', CONFIG.paths.filebeatRole);
    await createOrUpdateUser('filebeat_internal', CONFIG.credentials.filebeat, ['filebeat_writer']);    
    await installIndexTemplates();
    
    console.log('✅ Elasticsearch setup completed successfully.');
  } catch (err) {
    console.error('❌ Elasticsearch setup failed:', err.message);
    process.exit(1);
  }
}

module.exports = { setupElasticsearch };

if (require.main === module) {
  setupElasticsearch();
}
