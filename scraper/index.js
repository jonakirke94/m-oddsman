const { Player, MetaData, Result, Bets } = require('./document.js');
const { parseCommaFloat } = require('../util.js');

let chrome = {};
let puppeteer;

if (process.env.prod) {
	// running on the Vercel platform.
	chrome = require('chrome-aws-lambda');
	puppeteer = require('puppeteer-core');
  } else {
	// running locally.
	puppeteer = require('puppeteer');
  }

const scraper = (async(lastUpdated) => {
   

  const browser = await puppeteer.launch({
	args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
	headless: true,
	ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  
  await page.goto('http://theoddsman.dk/Stilling.htm', {
    waitUntil: 'networkidle2',
  });

  const metaData = await page.evaluate(() => {
	const metaData = {};
	
	const header = document.querySelector('table > tbody > tr:nth-child(2) > td:nth-child(3)');
	metaData.isSprintWeek = header.innerText.includes('Med spurt');
	metaData.currentWeek = header.innerText;

	if (metaData.isSprintWeek) {
		const sprintLead = document.querySelector('table > tbody > tr:nth-child(2) > td:nth-child(4)');
		metaData.sprintLead = sprintLead.innerText;
	}

	const footer = document.querySelector('table > tbody > tr:nth-child(52) > td:nth-child(5)');
	metaData.season = footer.innerText;

	const lastUpdatedBar = document.querySelector('table > tbody > tr:nth-child(53) > td:nth-child(7)');
	metaData.lastUpdated = lastUpdatedBar.innerText;

	return metaData;
  })
  
  const meta = new MetaData(metaData);

  if (meta.lastUpdated.getTime() === lastUpdated?.getTime()) {
	await browser.close();
	return new Result(false);
  } 

  const rawPlayers = await page.$$eval('tbody tr', rows => {
		const filtered = rows.filter((r, index) => index > 4 && index <= 43);
		return filtered.map((r) => {
			const cells = r.querySelectorAll('td');
			return Array.from(cells).map(td => {
				return {
					text: td.innerText,
					bg: td.style.background,
				};
			});
		});
  });

  await page.goto('http://theoddsman.dk/AlleOdds_pl.htm', {
    waitUntil: 'networkidle2',
  });

  
  const rawBets = await page.$$eval('tbody tr', rows => {
	const filtered = rows.filter((r, index) => index > 4 && index <= 121);
	return filtered.map((r) => {
		const cells = r.querySelectorAll('td');
		return Array.from(cells).map(td => {
			return td.innerText;
		});
	});
});

const buildBets = (rawBets) => {
	let lastSeenMatchDay = '';
	return rawBets.map((listProperties) => {
		const bets = new Bets();

		bets.hit = parseInt(listProperties[0]) > 0;
		const user = listProperties[1].split(' ');
		bets.position = parseInt(user[0].replace('.', ''))
		bets.initials = user[1];

		const matchNo = parseInt(listProperties[2]);
		bets.matchNumber = matchNo === 0 ? '?' : matchNo;

		bets.betValue = listProperties[3] == 0 ? '' : listProperties[3];

		bets.odds = parseCommaFloat(listProperties[4]);
		bets.result = (listProperties[5] + listProperties[6]) || '-';

		bets.hasResult = bets.result !== '-';

		bets.description = listProperties[7];

		const matchDayVal = listProperties[8];

		if (matchDayVal === '|') {
			bets.matchDay = lastSeenMatchDay;
		} else {
			bets.matchDay = matchDayVal;
			lastSeenMatchDay = matchDayVal;
		}

		bets.matchStart = listProperties[9]
		bets.matchEnd = listProperties[10]
		return bets;
	})
}


  const buildPlayers = (rawPlayers) => {
	return rawPlayers.map((listProperties) => {
		const player = new Player();

		player.position = parseInt(listProperties[0].text.replace('.', ''));
		player.initials = listProperties[1].text;
		player.name = listProperties[2].text;
		player.betCount = parseInt(listProperties[3].text);
		player.correctBets = parseInt(listProperties[4].text);
		player.points = parseCommaFloat(listProperties[5].text);
		player.distanceToLeader = parseCommaFloat(listProperties[7].text);
		player.pointsInCurrentWeek = parseCommaFloat(listProperties[8].text);
		player.isLeadingSprint = listProperties[8].bg === 'rgb(146, 208, 80)';
		player.pointsLastThreeWeeks = parseCommaFloat(listProperties[9].text);
		player.potentialPoints = parseCommaFloat(listProperties[10].text);
		player.canWinSprint = listProperties[10].bg === 'yellow';

		return player;
	})
  }
 

  const score = buildPlayers(rawPlayers);
  const bets = buildBets(rawBets);
  
  await browser.close();

  return new Result(true, meta, score, bets);
});

module.exports = scraper;