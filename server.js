const express = require('express');
const util = require('util');
const initCache = require('./cache/index.js');
const { runUpdaters, scheduleUpdaters } = require('./index.js');

const app = express();

let cacheClient = null;

initCache((client) => {
	cacheClient = client;
	cacheClient.get = util.promisify(client.get);
	runUpdaters(client);
	scheduleUpdaters(client);
});

app.set('view engine', 'ejs');

const port = 3000;

/*https://stackoverflow.com/questions/18629327/adding-css-file-to-ejs*/
app.use(express.static(__dirname + '/public'));

app.get('/', async(req, res) => {
   const score = await cacheClient.get("score");
   const meta = await cacheClient.get("meta");

	const parsedMeta = JSON.parse(meta);
	let playerArray = JSON.parse(score);

	let sort = req.query.sort;

	if (sort) {
		switch (sort) {
			case 'week':
				playerArray = playerArray.sort((a, b) => a.pointsInCurrentWeek > b.pointsInCurrentWeek ? -1 : 1);
				break;
			case 'correct':
				playerArray = playerArray.sort((a, b) => a.correctBets > b.correctBets ? -1 : 1);
				break;
			case 'name':
				playerArray = playerArray.sort((a, b) => a.name > b.name ? 1 : -1);
				break;
			default:
				playerArray = playerArray.sort((a, b) => a.position > b.position ? 1 : -1);
				break;
		}
	}

	res.render('pages/index', {
		data: playerArray,
		meta: parsedMeta,		
	});
});	

app.get('/match', async(req, res) => {
	res.render('pages/match', {
		data: 'test',
	});
});	

app.get('/placement', async(req, res) => {
	res.render('pages/placement', {
		data: 'test',
	});
});	
	
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});


/*{
	title: 'Oddsman',
}*/