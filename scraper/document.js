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
	constructor(wasUpdated, meta = null, score = null) {
		this.wasUpdated = wasUpdated;
		this.meta = meta;
		this.score = score;
	}
}

module.exports = {
	Player,
	MetaData,
	Result
}