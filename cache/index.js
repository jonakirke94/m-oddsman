const redis = require("redis");

const PORT = 6379;

const init = (onConnect) => {
	const client = redis.createClient(PORT);

	client.on("connect", function() {
		console.info('Connected Redis client');
		onConnect(client);
	});
	
	client.on("error", function() {		
		console.error('Redis error' ,error);
	});

	return client;
}

module.exports = init;



