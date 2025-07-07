#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

// Configuration constants
const CONFIG = {
  kibana: {
    url: process.env.KIBANA_URL || 'http://kibana:5601/kibana',
    username: process.env.ELASTIC_USERNAME || 'elastic',
    password: process.env.ELASTIC_PASSWORD
  },
  paths: {
    config: path.resolve(__dirname, '..', 'config'),
    get dataviews() { return path.join(this.config, 'dataviews') }
  },
  defaultTimeField: 'timestamp',
  retryInterval: 5000, // 5 seconds
  headers: {
    common: { 'kbn-xsrf': 'true' },
    json: { 'Content-Type': 'application/json' }
  }
};

// Standard index patterns to create data views for
const STANDARD_INDICES = [
  {name: "setup", index: "setup-*"},
  {name: "gateway", index: "gateway-*"},
  {name: "nginx", index: "nginx-*"},
  {name: "redis", index: "redis-*"},
  {name: "postgres_db", index: "postgres_db-*"},
  {name: "pgadmin", index: "pgadmin-*"},
  {name: "kafka", index: "kafka-*"},
  {name: "auth", index: "auth-*"},
  {name: "chat", index: "chat-*"},
  {name: "dash", index: "dash-*"},
  {name: "game", index: "game-*"},
  {name: "frontend", index: "frontend-*"}
];

// Special file names that need custom handling
const SPECIAL_FILES = {
  gatewaySearch: 'gateway-search.json'
};

/**
 * Create an axios instance with authentication
 * @returns {Object} Axios instance
 */
const createApiClient = () => {
  return axios.create({
    baseURL: CONFIG.kibana.url,
    auth: {
      username: CONFIG.kibana.username,
      password: CONFIG.kibana.password
    },
    headers: CONFIG.headers.common,
    validateStatus: () => true // Don't throw on non-2xx responses
  });
};

/**
 * Wait for Kibana to be ready
 */
const waitForKibana = async () => {
  console.log('Waiting for Kibana to be ready...');
  const apiClient = createApiClient();
  
  let isReady = false;
  while (!isReady) {
    try {
      const response = await apiClient.get('/api/status');
      
      if (response.status === 200) {
        console.log('Kibana is ready!');
        isReady = true;
      } else {
        console.log('Kibana is not ready yet. Waiting...');
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryInterval));
      }
    } catch (error) {
      console.log('Error connecting to Kibana:', error.message);
      await new Promise(resolve => setTimeout(resolve, CONFIG.retryInterval));
    }
  }
};


/**
 * Create a Kibana object via API
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Object data
 * @param {string} objectType - Type of object being created
 * @param {string} nameField - Field to use for object name in logs
 * @returns {Promise<Object>} Created object
 */
const createKibanaObject = async (endpoint, data, objectType, nameField) => {
  const apiClient = createApiClient();
  const displayName = data[nameField] || (data.attributes && data.attributes.title) || 'unknown';
  
  try {
    console.log(`Creating ${objectType}: ${displayName}`);
    
    const response = await apiClient.post(endpoint, data, {
      headers: CONFIG.headers.json
    });
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`${objectType} created: ${displayName}`);
      return response.data;
    } else {
      throw new Error(`Status ${response.status}: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.error(`Error creating ${objectType} ${displayName}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Create a data view
 * @param {Object} dataView - Data view configuration
 * @returns {Promise<Object>} Created data view
 */
const createDataView = async (dataView) => {
  return createKibanaObject(
    '/api/data_views/data_view',
    { data_view: dataView },
    'data view',
    'name'
  );
};


/**
 * Create standard data views for predefined indices
 */
const createStandardDataViews = async () => {
  console.log('Creating standard data views...');
  
  for (const index of STANDARD_INDICES) {
    const dataView = {
      name: index.name,
      title: index.index,
      allowHidden: false
    };
    
    try {
      await createDataView(dataView);
      console.log(`Standard data view created: ${index.name}`);
    } catch (error) {
      if (error.response?.status === 409) {
        console.log(`Data view ${index.name} already exists, skipping`);
      } else {
        console.error(`Error creating data view ${index.name}:`, error.message);
      }
    }
  }
};

/**
 * Main setup function
 */
const setupKibana = async () => {
  try {
    if (!CONFIG.kibana.password) {
      throw new Error('ELASTIC_PASSWORD environment variable is required');
    }    
    await waitForKibana();
    await createStandardDataViews();        
    process.exit(0);
  } catch (error) {
    if (error.response?.status === 400) {
      process.exit(0);
    } else {
      console.error('Setup failed:', error.message);
      process.exit(1);
    }
  }
};

if (require.main === module) {
  setupKibana();
}

module.exports = { setupKibana };
