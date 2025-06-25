const { spawn } = require('child_process');
const path = require('path');
const setupKafkaTopics = require('./kafka.js');
const { setupElasticsearch } = require('./elasticsearch');

// List of setup scripts to run
const setupScripts = [
  // 'kibana.js',
  // 'postgres.js'
  'kibana.js'
];

const runScript = (scriptPath) => {
  return new Promise((resolve, reject) => {
    console.log(`Running setup script: ${scriptPath}`);
    
    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`Successfully completed: ${scriptPath}`);
        resolve();
      } else {
        console.error(`Failed to run: ${scriptPath} with exit code: ${code}`);
        reject(new Error(`Script ${scriptPath} exited with code ${code}`));
      }
    });
  });
};

const main = async () => {
  try {
    console.log('Starting Elasticsearch setup...');
    await setupElasticsearch();
    console.log('Elasticsearch setup completed successfully.');
    
    console.log('Starting Kafka topics setup...');
    // const kafkaSetupSuccess = await setupKafkaTopics();
    // if (!kafkaSetupSuccess) {
    //   throw new Error('Kafka setup failed');
    // }
    console.log('Kafka topics setup completed successfully.');
    
    for (const script of setupScripts) {
      await runScript(script);
    }
    
    console.log('All setup scripts completed successfully.');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
};

main(); 