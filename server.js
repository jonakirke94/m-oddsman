const express = require('express');
const groupBy = require('lodash.groupby');
const { runUpdaters } = require('./index.js');
const path = require('path');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const port = 3000;

/*https://stackoverflow.com/questions/18629327/adding-css-file-to-ejs*/
app.use(express.static(__dirname + '/public'));

app.get('/', async(req, res) => {
   let { meta, score } = await runUpdaters();

	let sort = req.query.sort;
	let dir = req.query.dir || -1;

	if (sort) {
		switch (sort) {
			case 'week':
				score = score.sort((a, b) => a.pointsInCurrentWeek < b.pointsInCurrentWeek ? 1 * dir : -1 * dir);
				break;
			case 'correct':
				score = score.sort((a, b) => a.correctBets < b.correctBets ? 1 * dir : -1 * dir);
				break;
			case 'name':
				score = score.sort((a, b) => a.name > b.name ? 1 * dir : -1 * dir);
				break;
			default:
				score = score.sort((a, b) => a.position < b.position ? 1 * dir : -1 * dir);
				break;
		}
	}

	res.setHeader('Cache-Control', 's-max-age=600, stale-while-revalidate')
	res.render('pages/index', {
		data: score,
		meta: meta,
		sort: {
			key: sort || 'pos',
			dir: dir || -1,
		}
	});
});	

app.get('/match', async(req, res) => {
	const { bets } = await runUpdaters();
	const groupedByBet = groupBy(bets, 'matchNumber');

	const mapped = [];

	Object.keys(groupedByBet).map(function(key) {
		mapped.push({
			key: groupedByBet[key][0],
			players: groupedByBet[key],
		})
	});

	res.setHeader('Cache-Control', 's-max-age=600, stale-while-revalidate')
	res.render('pages/match', {
		data: mapped ,
	});
});	

app.get('/placement', async(req, res) => {
	const { bets } = await runUpdaters();
	const groupedByPosition = groupBy(bets, 'position');
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

	res.setHeader('Cache-Control', 's-max-age=600, stale-while-revalidate')
	res.render('pages/placement', {
		data: mapped,
	});
});	
	
app.listen(port, () => {
  console.log(`Oddsman app listening on port ${port}!`)
});
