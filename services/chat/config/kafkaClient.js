import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "my-app",
    brokers: ["127.0.0.1:9092"]
});

export default kafka
