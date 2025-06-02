const axios = require('axios');
const fs = require('fs');

const KIBANA_URL = process.env.KIBANA_URL || 'http://kibana:5601/kibana';
const ELASTIC_USERNAME = process.env.ELASTIC_USERNAME || 'elastic';
const ELASTIC_PASSWORD = process.env.ELASTIC_PASSWORD;

// Function to wait for Kibana to be ready
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

// Main function
const main = async () => {
  try {
    if (!ELASTIC_PASSWORD) {
      throw new Error('ELASTIC_PASSWORD environment variable is required');
    }
    await waitForKibana();    
    const dataViews = [
      {
        name: 'BlackHoleJS-frontend-logs',
        title: 'frontend-logs*',
        timeFieldName: '@timestamp'
        // TODO: add runtimeFieldMap for the data view
      }
    ];
    
    for (const dataView of dataViews) {
      await createDataView(dataView);
    }
    console.log('All data views created successfully!');
  } catch (error) {
    // if the error is 400, then the data view already exists
    if (error.response?.status === 400) {
      console.log('Data view already exists, skipping...');
      return;
    }
    console.error('Setup failed:', error);
    process.exit(1);
  }
  console.log('Setup completed successfully!');
  process.exit(0);
};

main();
