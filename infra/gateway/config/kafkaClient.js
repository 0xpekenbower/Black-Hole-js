import { Kafka } from "kafkajs";
import { kafka as kafkaConfig } from "./index.js";

const kafka = new Kafka({
    clientId: kafkaConfig.clientId,
    brokers: kafkaConfig.brokers
});

export default kafka; 