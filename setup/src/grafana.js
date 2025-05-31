#!/usr/bin/env node
// Using environment variables directly instead of loading from .env file
const axios = require('axios');

const GRAFANA_URL = process.env.GRAFANA_URL || 'http://localhost:7050/grafana';
const GRAFANA_USER = process.env.GRAFANA_USER || 'admin';
const GRAFANA_PASSWORD = process.env.GRAFANA_PASSWORD || 'admin';

const axiosInstance = axios.create({
  baseURL: GRAFANA_URL,
  auth: {
    username: GRAFANA_USER,
    password: GRAFANA_PASSWORD
  },
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true
});

async function waitForGrafana() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await axiosInstance.get('/api/health');
      if (res.status === 200 && res.data && res.data.database === 'ok') {
        return;
      }
    } catch {}
    console.log('Waiting for Grafana to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Grafana did not become ready in time');
}

async function main() {
  await waitForGrafana();
  console.log('✅ Grafana is up and healthy (default admin/admin)');
}

main().catch(err => {
  console.error('❌ Grafana setup failed:', err.message);
  process.exit(1);
}); 