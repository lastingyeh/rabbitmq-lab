const amqp = require('amqplib/callback_api');

const { rabbitmqHost } = require('../config');

amqp.connect(
	rabbitmqHost,
	(err, conn) => {
		conn.createChannel((err, ch) => {
			const q = 'task_queue';

			const msg = process.argv.slice(2).join(' ') || 'Hello World!';

			ch.assertQueue(q, { durable: true });
			ch.sendToQueue(q, new Buffer(msg), { persistent: true });

			console.log(" [x] Sent '%s'", msg);
		});

		setTimeout(() => {
			conn.close();
			process.exit(0);
		}, 500);
	},
);
