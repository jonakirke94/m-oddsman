const parseDocument = require('./scraper/index.js');
const schedule = require('node-schedule');
const util = require('util');


const runUpdaters = async (client) => {
	console.log('running updaters');
	client.get = util.promisify(client.get);

	let lastUpdated = await client.get('lastUpdated');
	lastUpdated = lastUpdated ? new Date(lastUpdated) : null;

	const result = await parseDocument(lastUpdated);

	if (result.wasUpdated) {
		console.log('The page was updated so setting new values');
		client.set('meta', JSON.stringify(result.meta))
		client.set('lastUpdated', result.meta.lastUpdated);
		client.set('score', JSON.stringify(result.score))
	}
}

const scheduleUpdaters = (client) => {
	// https://crontab.guru/#*/5_*_*_*_0,1,2,6
	// */5 * * * 0,1,2,6
	schedule.scheduleJob('* * * * 0,1,2,6', function(){
		runUpdaters(client);
	});
}

module.exports = {
	scheduleUpdaters,
	runUpdaters,
};