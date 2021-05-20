const express = require('express');
const initCache = require('./cache/index.js');
const groupBy = require('lodash.groupby');
const { runUpdaters, scheduleUpdaters } = require('./index.js');

const app = express();

const cacheClient = initCache();

runUpdaters(cacheClient);
scheduleUpdaters(cacheClient);

app.set('view engine', 'ejs');

const port = 3000;

/*https://stackoverflow.com/questions/18629327/adding-css-file-to-ejs*/
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
   const score = cacheClient.get("score");
   const meta = cacheClient.get("meta");

	const parsedMeta = JSON.parse(meta);
	let playerArray = JSON.parse(score);

	let sort = req.query.sort;
	let dir = req.query.dir || -1;

	if (sort) {
		switch (sort) {
			case 'week':
				playerArray = playerArray.sort((a, b) => a.pointsInCurrentWeek < b.pointsInCurrentWeek ? 1 * dir : -1 * dir);
				break;
			case 'correct':
				playerArray = playerArray.sort((a, b) => a.correctBets < b.correctBets ? 1 * dir : -1 * dir);
				break;
			case 'name':
				playerArray = playerArray.sort((a, b) => a.name > b.name ? 1 * dir : -1 * dir);
				break;
			default:
				playerArray = playerArray.sort((a, b) => a.position < b.position ? 1 * dir : -1 * dir);
				break;
		}
	}

	res.render('pages/index', {
		data: playerArray,
		meta: parsedMeta,
		sort: {
			key: sort || 'pos',
			dir: dir || -1,
		}
	});
});	

app.get('/match', (req, res) => {
	const bets = cacheClient.get("bets");
	const parsedBets = JSON.parse(bets);
	const groupedByBet = groupBy(parsedBets, 'matchNumber');

	const mapped = [];

	Object.keys(groupedByBet).map(function(key) {
		mapped.push({
			key: groupedByBet[key][0],
			players: groupedByBet[key],
		})
	});

	res.render('pages/match', {
		data: mapped ,
	});
});	

app.get('/placement', (req, res) => {
	const bets = cacheClient.get("bets");
	const parsedBets = JSON.parse(bets);
	const groupedByPosition = groupBy(parsedBets, 'position');
	const mapped = [];

	Object.keys(groupedByPosition).map(function(key) {
		mapped.push({
			key: `${key}. ${groupedByPosition[key][0].initials}`,
			items: groupedByPosition[key],
			correctDots: groupedByPosition[key].map((b) => {
				if (!b.hasResult) return 'UNKNOWN';

				return b.hit ? 'HIT' : 'MISSED';
			})
		})
	});
	res.render('pages/placement', {
		data: mapped,
	});
});	
	
app.listen(port, () => {
  console.log(`Oddsman app listening on port ${port}!`)
});
