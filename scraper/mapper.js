const { Player, Bets } = require('./document.js');
const { parseCommaFloat } = require('../util.js');

const mapPlayers = (rawPlayers) => {
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

  
const mapBets = (rawBets) => {
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


module.exports = {
	mapPlayers,
	mapBets,
};