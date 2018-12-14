const amqp = require('amqplib/callback_api');

const args = process.argv.slice(2);

if (args.length == 0) {
	console.log('Usage: rpc_client.js num');
	process.exit(1);
}

amqp.connect(
	'amqp://localhost',
	function(err, conn) {
		conn.createChannel(function(err, ch) {
			ch.assertQueue('', { exclusive: true }, function(err, q) {
				const corr = generateUuid();
				const num = parseInt(args[0]);

				console.log(' [x] Requesting fib(%d)', num);

        // step 4. client receive handle result from server
				ch.consume(
					q.queue,
					function(msg) {
						if (msg.properties.correlationId == corr) {
							console.log(' [.] Got %s', msg.content.toString());
							setTimeout(function() {
								conn.close();
								process.exit(0);
							}, 500);
						}
					},
					{ noAck: true },
				);
        
        // step1. send rpc_queue msg to server...
        // (queueName, msg, {correlationId, replyTo})
				ch.sendToQueue('rpc_queue', new Buffer(num.toString()), {
					correlationId: corr,
					replyTo: q.queue,
				});
			});
		});
	},
);

function generateUuid() {
	return (
		Math.random().toString() +
		Math.random().toString() +
		Math.random().toString()
	);
}
