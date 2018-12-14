const amqp = require('amqplib/callback_api');

const { rabbitmqHost } = require('../config');

amqp.connect(
	rabbitmqHost,
	(err, conn) => {
		conn.createChannel((err, ch) => {
			const q = 'hello';

			// ch.assertQueue(q, { durable: false });

			console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', q);

			ch.consume(
				q,
				msg => {
					console.log(' [x] Received %s', msg.content.toString());
				},
				{ noAck: true },
			);
		});
	},
);
