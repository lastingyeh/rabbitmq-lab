const amqp = require('amqplib/callback_api');

amqp.connect(
	'amqp://localhost',
	function(err, conn) {
		conn.createChannel(function(err, ch) {
			const q = 'rpc_queue';

			ch.assertQueue(q, { durable: false });
			// check queue ack as busy to balance send jobs
			ch.prefetch(1);
			console.log(' [x] Awaiting RPC requests');

      // step2. server receive rpc_queue request
			ch.consume(q, function reply(msg) {
				const n = parseInt(msg.content.toString());

				console.log(' [.] fib(%d)', n);

				const r = fibonacci(n);

        // step3. send back msg to client (replyTo, msg, {correlationId})
				ch.sendToQueue(msg.properties.replyTo, new Buffer(r.toString()), {
					correlationId: msg.properties.correlationId,
				});

        // confirm consume received as set 'noAck: true'
				ch.ack(msg);
			});
		});
	},
);

function fibonacci(n) {
	if (n == 0 || n == 1) return n;

	return fibonacci(n - 1) + fibonacci(n - 2);
}
