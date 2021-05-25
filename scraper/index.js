const { MetaData, Result } = require('./document.js');
const { mapBets, mapPlayers } = require('./mapper');

const chromium = require('chrome-aws-lambda');
const playwright = require('playwright-core');

const scraper = (async() => {
	let browser;
	let context;
	let page;
	let networkIdle;

	if (process.env.VERCEL_ENV === 'production') {
		browser = await playwright.chromium.launch({
			args: chromium.args,
			executablePath: await chromium.executablePath,
			headless: chromium.headless,
		  });
	
	  	context = await browser.newContext();
		page = await context.newPage();
		networkIdle = 'networkidle';
	} else {
		const puppeteer = require('puppeteer');
		browser = await puppeteer.launch({
			headless: true,
		});
  		page = await browser.newPage();
		networkIdle = 'networkidle2'
	}
 
  
  await page.goto('http://theoddsman.dk/Stilling.htm', {
    waitUntil: networkIdle,
  });

  const metaData = await page.evaluate(() => {
	const metaData = {};
	
	const header = document.querySelector('table > tbody > tr:nth-child(2) > td:nth-child(3)');
	metaData.isSprintWeek = header.innerText.includes('Med spurt');

	const currentWeek = document.querySelector('table > tbody > tr:nth-child(4) > td:nth-child(9)');
	metaData.currentWeek = currentWeek.innerText;

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
    waitUntil: networkIdle,
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

  const score = mapPlayers(rawPlayers);
  const bets = mapBets(rawBets);
  
  await browser.close();

  return new Result(true, meta, score, bets);
});

module.exports = scraper;