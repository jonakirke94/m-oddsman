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

	const parsedScore = JSON.parse(score);
    console.log(parsedScore, 'parsedScore');
	const parsedMeta = JSON.parse(meta);
    console.log(parsedMeta, 'parsedMeta');
	res.render('pages/index', {
		title: 'Oddsman',
	});
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});
