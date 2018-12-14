const amqp = require('amqplib/callback_api');

const { rabbitmqHost } = require('../config');

amqp.connect(
	rabbitmqHost,
	(err, conn) => {
		conn.createChannel((err, ch) => {
			const q = 'hello';

			ch.assertQueue(q, { durable: false });

			ch.sendToQueue(q, new Buffer('Hello World!'));

			console.log(" [x] Sent 'Hello World!'");
		});

		setTimeout(() => {
			conn.close();
			process.exit(0);
		}, 500);
	},
);
