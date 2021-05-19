const parse = require('date-fns/parse')
const da = require('date-fns/locale/da');
const {zonedTimeToUtc} = require('date-fns-tz');

const { parseCommaFloat } = require('../util.js');

class Player {
	constructor() {
		this.position = 0;
		this.initials = '';
		this.name = '';
		this.betCount = 0;
		this.correctBets = 0;
		this.points = 0.0;
		this.distanceToLeader = 0;
		this.pointsInCurrentWeek = 0;
		this.isLeadingSprint = false;
		this.pointsLastThreeWeeks = 0;
		this.potentialPoints = 0;
		this.canWinSprint = false;
	}
}

class Bets {
	constructor() {
		this.hit = false;
		this.hasResult = false;
		this.position = 0;
		this.initials = '';
		this.matchNumber = 0;
		this.betValue = ''; // 1 x 2
		this.odds = 0;
		this.result = 0;
		this.description;
		this.matchDay;
		this.matchStart;
		this.matchEnd;
	}


}

class MetaData {
	constructor(domObject) {
		this.startWeek = 2;
		this.endWeek = 20;
		this.currentWeek = parseInt(domObject.currentWeek.replace(/[^0-9]/g,''));
		this.isSprintWeek = domObject.isSprintWeek;

		if (this.isSprintWeek) {
			this.sprintLead =  parseCommaFloat(domObject.sprintLead);
		}

		this.season = domObject.season;

		const cleaned = domObject.lastUpdated.replace('.', '').replace('kl', '').replace(/\s{2,}/g, ' ');

		const parsedDate = parse(cleaned, 'd LLL HH:mm', new Date(), {
			locale: da,
		});

		this.lastUpdated = parsedDate;
	}
}

class Result {
	constructor(wasUpdated, meta = null, score = null, bets = null) {
		this.wasUpdated = wasUpdated;
		this.meta = meta;
		this.score = score;
		this.bets = bets;
	}
}

module.exports = {
	Player,
	MetaData,
	Bets,
	Result
}