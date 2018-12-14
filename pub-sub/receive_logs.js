const amqp = require('amqplib/callback_api');

const { rabbitmqHost } = require('../config');

amqp.connect(
	rabbitmqHost,
	(err, conn) => {
		conn.createChannel((err, ch) => {
			const ex = 'logs';

      ch.assertExchange(ex, 'fanout', { durable: false });
      // as queue: '', return random queueName
      // exclusive: generate unique queueName
			ch.assertQueue('', { exclusive: true }, (err, q) => {
				console.log(
					' [*] Waiting for messages in %s. To exit press CTRL+C',
					q.queue,
				);
        // bind exchange to queue
				ch.bindQueue(q.queue, ex, '');
				ch.consume(
					q.queue,
					msg => {
						if (msg.content) {
							console.log(' [x] %s', msg.content.toString());
						}
					},
					{ noAck: true },
				);
			});
		});
	},
);
