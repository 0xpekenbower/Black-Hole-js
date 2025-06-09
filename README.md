# BlackHoleJs

A modern web application featuring a multiplayer game, real-time chat, authentication, and comprehensive dashboards.

## Project Overview

BlackHoleJs is a full-stack application built with Next.js for the frontend and a microservices architecture for the backend. The project includes features like user authentication, real-time chat, gaming, metrics, and more.

## Directory Structure

```
BlackHoleJs
├── frontend/             # Next.js frontend application
├── services/             # Backend microservices
│   ├── auth/             # Authentication service
│   ├── chat/             # Real-time chat service
│   ├── dashboard/        # Dashboard data service
│   └── game/             # Game logic service
├── infra/                # Infrastructure configuration
│   ├── gateway/          # API gateway (Nginx)
│   └── logs/             # Logging configuration
├── logs/                 # Logging system with Vector
├── metrics/              # Metrics and monitoring
├── setup/                # Project setup scripts
└── doc/                  # Documentation
```

## Technology Stack

<div align="center">
  <img src="https://img.shields.io/badge/next.js_15.3.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19.0.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Node.js_23.0.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Docker_28.2.2-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/nginx_1.28.0-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
  <img src="https://img.shields.io/badge/grafana_12.0.1-%23F46800.svg?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana" />
  <img src="https://img.shields.io/badge/Prometheus_3.4.0-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Prometheus" />
  <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="JavaScript" />
  <img src="https://img.shields.io/badge/TypeScript_5.0.0-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white" alt="ESLint" />
  <img src="https://img.shields.io/badge/redis_8.0.0-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/PostgreSQL_17.5-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Elasticsearch_9.0.0-005571?style=for-the-badge&logo=elasticsearch&logoColor=white" alt="Elasticsearch" />
  <img src="https://img.shields.io/badge/Kibana_9.0.0-005571?style=for-the-badge&logo=Kibana&logoColor=white" alt="Kibana" />
  <img src="https://img.shields.io/badge/Logstash_9.0.0-005571?style=for-the-badge&logo=logstash&logoColor=white" alt="Logstash" />
  <img src="https://img.shields.io/badge/Vector_0.47.0-00AFF4?style=for-the-badge&logo=vector&logoColor=white" alt="Vector" />
  <img src="https://img.shields.io/badge/Node_Exporter_1.9.1-E43526?style=for-the-badge&logo=prometheus&logoColor=white" alt="Node Exporter" />
  <img src="https://img.shields.io/badge/Cadvisor_0.52.1-00ADD8?style=for-the-badge&logo=google&logoColor=white" alt="Cadvisor" />
  <img src="https://img.shields.io/badge/Redis_Exporter_1.73.0-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white" alt="Redis Exporter" />
  <img src="https://img.shields.io/badge/Postgres_Exporter_0.17.0-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="Postgres Exporter" />
  <img src="https://img.shields.io/badge/Kafka_3.7.0-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white" alt="Kafka" />
  <img src="https://img.shields.io/badge/Swagger_4.15.5-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
  <img src="https://img.shields.io/badge/Pino_Logger-0A0A0A?style=for-the-badge&logo=logstash&logoColor=white" alt="Pino Logger" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</div>

## Architecture

<div align="center">
  <p><strong>Note:</strong> Please view the complete architecture diagram in your browser: <a href="doc/Architecture.pdf" target="_blank">View Architecture PDF</a></p>
  
  <a href="doc/Architecture.pdf" target="_blank">
    <img src="https://img.shields.io/badge/View-Architecture_Diagram_(PDF)-blue?style=for-the-badge&logo=adobe-acrobat-reader" alt="View Architecture PDF">
  </a>
</div>

## How to run the project

```shell
make # build and run all services
make up # run all services without build (if you already have the services running)
make down # stop and remove all services (without removing volumes and networks , avoid deleting data)
make fdown # stop and remove all services and volumes and networks (delete all data fresh start without deleting the images)
make logs_stack # run only logs services (elasticsearch, kibana, logstash, vector)
make metrics_stack # run only metrics services (prometheus, grafana, node_exporter, cadvisor, redis_exporter, postgres_exporter)
make minimal_stack # run only minimal services (frontend, gateway, nginx, redis, postgres_db, auth, dashboard, chat, game)
```
