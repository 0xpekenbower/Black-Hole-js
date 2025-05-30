#!/usr/bin/env node
require('dotenv').config();

const { setupElasticsearch } = require('./src/elasticsearch');

setupElasticsearch()
  .then(() => {
    console.log('✅ Elasticsearch setup complete');
  })
  .catch((err) => {
    console.error('❌ Elasticsearch setup failed:', err.message);
    process.exit(1);
  });
