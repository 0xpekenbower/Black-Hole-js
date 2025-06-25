#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const axios = require('axios');

const CONFIG_DIR = path.resolve(__dirname, '..', 'config');
const LOGSTASH_ROLE_FILE = path.join(CONFIG_DIR, 'logstash_writer.json');
const FILEBEAT_ROLE_FILE = path.join(CONFIG_DIR, 'filebeat_writer.json');
const GATEWAY_TEMPLATE_FILE = path.join(CONFIG_DIR, 'gateway.json');

const ES_HOST = 'http://elasticsearch:9200';
const REQUIRED_ENV_VARS = ['ELASTIC_PASSWORD', 'KIBANA_SYSTEM_PASSWORD', 'LOGSTASH_INTERNAL_PASSWORD', 'FILEBEAT_INTERNAL_PASSWORD'];

for (const varName of REQUIRED_ENV_VARS) {
  if (!process.env[varName]) {
    console.error(`Error: Missing environment variable ${varName}`);
    process.exit(1);
  }
}

const AUTH = {
  username: 'elastic',
  password: process.env.ELASTIC_PASSWORD
};

const axiosInstance = axios.create({
  baseURL: ES_HOST,
  auth: AUTH,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true
});

async function waitForES() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await axiosInstance.get('/');
      if (res.status === 200) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  throw new Error('Elasticsearch did not become ready in time');
}

async function setKibanaPassword() {
  const res = await axiosInstance.post('/_security/user/kibana_system/_password', {
    password: process.env.KIBANA_SYSTEM_PASSWORD
  });
  if (res.status !== 200) {
    throw new Error('Failed to update password for kibana_system');
  }
}

async function createLogstashRole() {
  const data = await fs.readFile(LOGSTASH_ROLE_FILE, 'utf8');
  const res = await axiosInstance.post('/_security/role/logstash_writer', JSON.parse(data));
  if (res.status !== 200) {
    throw new Error('Failed to create role logstash_writer');
  }
}

async function createFilebeatRole() {
  const data = await fs.readFile(FILEBEAT_ROLE_FILE, 'utf8');
  const res = await axiosInstance.post('/_security/role/filebeat_writer', JSON.parse(data));
  if (res.status !== 200) {
    throw new Error('Failed to create role filebeat_writer');
  }
}

async function createLogstashUser() {
  const res = await axiosInstance.get('/_security/user/logstash_internal');
  if (res.status === 200) {
    const update = await axiosInstance.post('/_security/user/logstash_internal/_password', {
      password: process.env.LOGSTASH_INTERNAL_PASSWORD
    });
    if (update.status !== 200) {
      throw new Error('Failed to update password for logstash_internal');
    }
  } else {
    const create = await axiosInstance.post('/_security/user/logstash_internal', {
      password: process.env.LOGSTASH_INTERNAL_PASSWORD,
      roles: ['logstash_writer']
    });
    if (create.status !== 200) {
      throw new Error('Failed to create user logstash_internal');
    }
  }
}

async function createFilebeatUser() {
  const res = await axiosInstance.get('/_security/user/filebeat_internal');
  if (res.status === 200) {
    const update = await axiosInstance.post('/_security/user/filebeat_internal/_password', {
      password: process.env.FILEBEAT_INTERNAL_PASSWORD
    });
    if (update.status !== 200) {
      throw new Error('Failed to update password for filebeat_internal');
    }
  } else {
    const create = await axiosInstance.post('/_security/user/filebeat_internal', {
      password: process.env.FILEBEAT_INTERNAL_PASSWORD,
      roles: ['filebeat_writer']
    });
    if (create.status !== 200) {
      throw new Error('Failed to create user filebeat_internal');
    }
  }
}


async function installGatewayTemplateAndPolicy() {
  console.log("Starting Gateway logs setup...");
  const fileData = await fs.readFile(GATEWAY_TEMPLATE_FILE, 'utf8');
  const parsed = JSON.parse(fileData);

  const policyName = Object.keys(parsed.policies || {})[0];
  if (!policyName) throw new Error('Policy name not found in gateway.json');

  const policyContent = parsed.policies[policyName].policy;
  if (!policyContent) throw new Error('Policy content not found');

  const policyRes = await axiosInstance.put(`/_ilm/policy/${policyName}`, { policy: policyContent });
  if (policyRes.status !== 200) throw new Error('Failed to create ILM policy');
  console.log(`✅ Created ILM policy: ${policyName}`);

  const templateName = Object.keys(parsed.templates || {})[0];
  if (!templateName) throw new Error('Template name not found');

  const templateContent = parsed.templates[templateName];
  if (!templateContent) throw new Error('Template content not found');

  const templateRes = await axiosInstance.put(`/_index_template/${templateName}`, templateContent);
  if (templateRes.status !== 200) {
    console.error('Template creation error:', JSON.stringify(templateRes.data, null, 2));
    throw new Error('Failed to create index template');
  }
  console.log(`✅ Created index template: ${templateName}`);
}

async function setupElasticsearch() {
  await waitForES();
  await setKibanaPassword();
  await createLogstashRole();
  await createLogstashUser();
  await createFilebeatRole();
  await createFilebeatUser();
  await installGatewayTemplateAndPolicy();
}

module.exports = { setupElasticsearch };

if (require.main === module) {
  setupElasticsearch()
    .then(() => {
      console.log('✅ Elasticsearch setup completed successfully.');
    })
    .catch((err) => {
      console.error('❌ Elasticsearch setup failed:', err.message);
      process.exit(1);
    });
}
