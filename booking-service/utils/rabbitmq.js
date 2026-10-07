const amqp = require('amqplib');

let channel = null;

const connectRabbitMQ = async () => {
    try {
        const amqpUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
        const connection = await amqp.connect(amqpUrl);
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error.message);
        // Retry connection after 5 seconds
        setTimeout(connectRabbitMQ, 5000);
    }
};

const publishEvent = async (exchangeName, routingKey, eventData) => {
    if (!channel) {
        console.error('RabbitMQ channel not established. Cannot publish event.');
        return;
    }

    try {
        await channel.assertExchange(exchangeName, 'topic', { durable: true });
        
        // MassTransit expects messages in a specific wrapper format (or we can use raw JSON and configure MassTransit to accept it)
        // By default, MassTransit expects an urn:message wrapper, but it can also consume raw JSON if configured,
        // or we can format it exactly as MassTransit expects.
        // Easiest is to format as MassTransit message envelope:
        const message = {
            messageId: require('crypto').randomUUID(),
            messageType: [`urn:message:PaymentService.Events:${eventData.eventType}`],
            message: eventData
        };

        channel.publish(
            exchangeName,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            { persistent: true, contentType: 'application/vnd.masstransit+json' }
        );
        console.log(`Event ${eventData.eventType} published to ${exchangeName}`);
    } catch (error) {
        console.error('Error publishing event:', error.message);
    }
};

module.exports = {
    connectRabbitMQ,
    publishEvent
};
