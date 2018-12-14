const amqp = require('amqplib/callback_api');

const { rabbitmqHost } = require('../config');

amqp.connect(
	rabbitmqHost,
	(err, conn) => {
		conn.createChannel((err, ch) => {
			const ex = 'direct_logs';
			const args = process.argv.slice(2);
			const msg = args.slice(1).join(' ') || 'Hello World!';
			const severity = args.length > 0 ? args[0] : 'info';

			ch.assertExchange(ex, 'direct', { durable: false });
			ch.publish(ex, severity, new Buffer(msg));

			console.log(" [x] Sent %s: '%s'", severity, msg);
		});

		setTimeout(() => {
			conn.close();
			process.exit(0);
		}, 500);
	},
);
