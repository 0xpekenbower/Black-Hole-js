#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs');

const KIBANA_URL = process.env.KIBANA_URL || 'http://kibana:5601/kibana';
const ELASTIC_USERNAME = process.env.ELASTIC_USERNAME || 'elastic';
const ELASTIC_PASSWORD = process.env.ELASTIC_PASSWORD;

const waitForKibana = async () => {
  console.log('Waiting for Kibana to be ready...');
  let isReady = false;
  while (!isReady) {
    try {
      const response = await axios.get(`${KIBANA_URL}/api/status`, {
        headers: {
          'kbn-xsrf': 'true'
        },
        auth: {
          username: ELASTIC_USERNAME,
          password: ELASTIC_PASSWORD
        },
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        console.log('Kibana is ready!');
        isReady = true;
      } else {
        console.log('Kibana is not ready yet. Waiting...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.log('Error connecting to Kibana:', error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

// Function to check if a data view exists
const checkDataViewExists = async (title) => {
  try {
    const response = await axios.get(
      `${KIBANA_URL}/api/data_views/data_view`,
      {
        headers: {
          'kbn-xsrf': 'string',
        },
        auth: {
          username: ELASTIC_USERNAME,
          password: ELASTIC_PASSWORD
        }
      }
    );
    
    const dataViews = response.data?.data_views || [];
    return dataViews.some(view => view.title === title);
  } catch (error) {
    console.error('Error checking if data view exists:', error.message);
    return false;
  }
};

// Function to create a data view
const createDataView = async (dataView) => {
  try {
    console.log(`Creating data view: ${dataView.name}`);
    
    const response = await axios.post(
      `${KIBANA_URL}/api/data_views/data_view`,
      { data_view: dataView },
      {
        headers: {
          'kbn-xsrf': 'string',
          'Content-Type': 'application/json'
        },
        auth: {
          username: ELASTIC_USERNAME,
          password: ELASTIC_PASSWORD
        }
      }
    );
    console.log(`Data view created: ${dataView.name}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating data view ${dataView.name}:`, error.response?.data || error.message);
    throw error;
  }
};

// Function to create a tag
const createTag = async (tag) => {
  try {
    console.log(`Creating tag: ${tag.attributes.name}`);
    
    const response = await axios.post(
      `${KIBANA_URL}/api/saved_objects/tag`,
      tag,
      {
        headers: {
          'kbn-xsrf': 'string',
          'Content-Type': 'application/json'
        },
        auth: {
          username: ELASTIC_USERNAME,
          password: ELASTIC_PASSWORD
        }
      }
    );
    console.log(`Tag created: ${tag.attributes.name}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating tag ${tag.attributes.name}:`, error.response?.data || error.message);
    throw error;
  }
};

// Function to create a search
const createSearch = async (search) => {
  try {
    console.log(`Creating search: ${search.attributes.title}`);
    
    const response = await axios.post(
      `${KIBANA_URL}/api/saved_objects/search`,
      search,
      {
        headers: {
          'kbn-xsrf': 'string',
          'Content-Type': 'application/json'
        },
        auth: {
          username: ELASTIC_USERNAME,
          password: ELASTIC_PASSWORD
        }
      }
    );
    console.log(`Search created: ${search.attributes.title}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating search ${search.attributes.title}:`, error.response?.data || error.message);
    throw error;
  }
};

// Main function
const setupKibana = async () => {
  try {
    if (!ELASTIC_PASSWORD) {
      throw new Error('ELASTIC_PASSWORD environment variable is required');
    }
    await waitForKibana();
    
    const gatewayDataView = {
      name: 'gateway-logs',
      title: 'gateway-logs*',
      timeFieldName: 'timestamp',
      allowHidden: false
    };
    
    const dataViewExists = await checkDataViewExists(gatewayDataView.title);
    if (dataViewExists) {
      console.log('Data view already exists, skipping creation');
    } else {
      const dataViewResponse = await createDataView(gatewayDataView);
      console.log('Data view created with ID:', dataViewResponse.id);
    }
    
    const gatewayTag = {
      attributes: {
        color: '#f950ca',
        description: '',
        name: 'Gateway'
      }
    };
    
    const tagResponse = await createTag(gatewayTag);
    console.log('Tag created with ID:', tagResponse.id);
    
    let dataViewId;
    if (dataViewExists) {
      const response = await axios.get(
        `${KIBANA_URL}/api/data_views/data_view`,
        {
          headers: {
            'kbn-xsrf': 'string',
          },
          auth: {
            username: ELASTIC_USERNAME,
            password: ELASTIC_PASSWORD
          }
        }
      );
      
      const dataViews = response.data?.data_views || [];
      const existingDataView = dataViews.find(view => view.title === gatewayDataView.title);
      if (existingDataView) {
        dataViewId = existingDataView.id;
      }
    }
    
    const gatewaySearch = {
      attributes: {
        columns: [
          'timestamp',
          'level',
          'event_type',
          'frontend.clientIp',
          'frontend.request.method',
          'frontend.request.url',
          'frontend.request.referrer',
          'gateway.forwarded.service',
          'gateway.response.statusCode',
          'context.userId',
          'context.sessionId',
          'requestId'
        ],
        density: 'compact',
        description: 'Gateway Logs View',
        grid: {
          columns: {
            'level': { width: 80 },
            'event_type': { width: 120 },
            'frontend.clientIp': { width: 120 },
            'frontend.request.method': { width: 80 },
            'frontend.request.url': { width: 250 },
            'gateway.forwarded.service': { width: 150 },
            'gateway.response.statusCode': { width: 100 },
            'context.userId': { width: 100 },
            'requestId': { width: 200 }
          }
        },
        headerRowHeight: 5,
        hideChart: false,
        isTextBasedQuery: false,
        kibanaSavedObjectMeta: {
          searchSourceJSON: JSON.stringify({
            query: { query: '', language: 'kuery' },
            filter: []
          })
        },
        refreshInterval: {
          pause: true,
          value: 60000
        },
        rowHeight: 3,
        sort: [['timestamp', 'desc']],
        timeRange: {
          from: 'now-15m',
          to: 'now'
        },
        timeRestore: true,
        title: 'gateway-logs'
      },
      references: [
        {
          id: dataViewId || (dataViewExists ? '' : dataViewResponse.id),
          name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
          type: 'index-pattern'
        },
        {
          id: tagResponse.id,
          name: `tag-ref-${tagResponse.id}`,
          type: 'tag'
        }
      ]
    };
    
    await createSearch(gatewaySearch);
    
    console.log('All Kibana objects created successfully!');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('Some objects already exist, continuing...');
    } else {
      console.error('Setup failed:', error);
      process.exit(1);
    }
  }
  console.log('Setup completed successfully!');
  process.exit(0);
};

if (require.main === module) {
  setupKibana();
}

module.exports = { setupKibana };
