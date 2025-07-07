import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "blackholejs-chat",
    brokers: ["kafka:9092"]
});

export default kafka
