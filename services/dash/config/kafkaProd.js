import kafka from './kafkaClient.js'

const kafkaProd = async (topic, raw_data) => {
    const prod = kafka.producer()
    
    await prod.connect()
    await prod.send({
            topic: topic,
            messages : [ {value : JSON.stringify(raw_data)} ]
    })
    await prod.disconnect()

}

export default kafkaProd