import { Kafka } from "kafkajs";
// import pool from '../config/pooling.js'

const kafka = new Kafka({
	clientId: "blackholejs-game",
	brokers: ["kafka:9092"]
});


export default kafka;