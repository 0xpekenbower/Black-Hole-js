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
  credentials: {
    kibana: process.env.KIBANA_SYSTEM_PASSWORD,
  },
  retryInterval: 5000, // 5 seconds
  maxRetries: 60 // 5 minutes total
};

const REQUIRED_ENV_VARS = [
  'ELASTIC_PASSWORD', 
  'KIBANA_SYSTEM_PASSWORD', 
];

for (const varName of REQUIRED_ENV_VARS) {
  if (!process.env[varName]) {
    console.error(`Error: Missing environment variable ${varName}`);
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
      console.log(`Elasticsearch returned status ${res.status}, waiting...`);
    } catch (error) {
      console.log('Elasticsearch not ready yet:', error.message);
    }
    await new Promise(resolve => setTimeout(resolve, CONFIG.retryInterval));
  }
  throw new Error('Elasticsearch did not become ready in time');
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
    throw new Error('Failed to update password for kibana_system');
  }
  
  console.log('Kibana system password updated successfully');
}

/**
 * Main function to set up Elasticsearch
 * @returns {Promise<void>}
 */
async function setupElasticsearch() {
  try {
    await waitForES();
    await setKibanaPassword();
    console.log('Elasticsearch setup completed successfully.');
  } catch (err) {
    console.error('Elasticsearch setup failed:', err.message);
    process.exit(1);
  }
}

module.exports = { setupElasticsearch };

if (require.main === module) {
  setupElasticsearch();
}
