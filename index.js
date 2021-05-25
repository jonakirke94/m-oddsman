const parseDocument = require('./scraper/index.js');

const runUpdaters = async() => {
	const result = await parseDocument();

	return {
		'meta': result.meta,
		'bets': result.bets,
		'score': result.score,
	};
}

module.exports = {
	runUpdaters,
};