const amqp = require('amqplib/callback_api');

const { rabbitmqHost } = require('../config');

const args = process.argv.slice(2);

if (args.length === 0) {
	console.log('Usage: receive_logs_topic.js <facility>.<severity>');
	process.exit(1);
}

amqp.connect(
	rabbitmqHost,
	(err, conn) => {
		conn.createChannel((err, ch) => {
			const ex = 'topic_logs';

			ch.assertExchange(ex, 'topic', { durable: false });
			// as queue: '', return random queueName
			// exclusive: generate unique queueName
			ch.assertQueue('', { exclusive: true }, (err, q) => {
        console.log(' [*] Waiting for logs. To exit press CTRL+C');
				// according to severity to bindQueue
				args.forEach(key => {
					ch.bindQueue(q.queue, ex, key);
				});

				ch.consume(
					q.queue,
					msg => {
						if (msg.content) {
							console.log(
								" [x] %s: '%s'",
								msg.fields.routingKey,
								msg.content.toString(),
							);
						}
					},
					{ noAck: true },
				);
			});
		});
	},
);