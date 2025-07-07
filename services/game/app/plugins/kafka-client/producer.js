

import kafka from "./connection.js";
import FP from 'fastify-plugin';


async function kafkaProducerPlugin(fastify) {
	const producer = kafka.producer();

	await producer.connect();

	fastify.decorate('kafka', {
		producer,
		send: async (topic, messages) => {
			return await producer.send({ topic, messages });
		}
	});

	fastify.addHook('onClose', async () => {
		await producer.disconnect();
	});
}

export default FP(kafkaProducerPlugin);