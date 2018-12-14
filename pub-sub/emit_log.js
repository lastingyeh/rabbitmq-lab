const amqp = require('amqplib/callback_api');

const { rabbitmqHost } = require('../config');

amqp.connect(
	rabbitmqHost,
	(err, conn) => {
		conn.createChannel((err, ch) => {
			const ex = 'logs';
			const msg = process.argv.slice(2).join(' ') || 'Hello World!';

			ch.assertExchange(ex, 'fanout', { durable: false });
			ch.publish(ex, '', new Buffer(msg));

			console.log(' [x] Sent %s', msg);
		});

		setTimeout(() => {
			conn.close();
			process.exit(0);
		}, 500);
	},
);
