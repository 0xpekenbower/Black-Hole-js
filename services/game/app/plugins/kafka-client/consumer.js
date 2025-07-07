
import kafka from "./connection.js";


const kafkaConsumer = async (fastify) => {
	try {
		const consumer = kafka.consumer({ groupId: 'game-grp' })

		await consumer.connect()
		await consumer.subscribe({ topic: 'newUser', fromBeginning: false })

		consumer.run({
			eachMessage: async ({ topic, message }) => {

				if (topic == 'newUser') {
					const { id, username, email, first_name, last_name, is_oauth } = JSON.parse(message.value)
					// TODO unused data
					await fastify.UserDataBase.createUser(id);
				}
			},
		})

		fastify.addHook('onClose', async () => {
			await consumer.disconnect()
		})

		fastify.log.info("Kafka consumer pluged √");

	}
	catch (err) {
		console.log(`[KAFKA] ${err}`)
	}
}

export default kafkaConsumer