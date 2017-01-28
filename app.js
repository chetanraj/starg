'use strict';

const GitHubApi = require('github');
const loading = require('loading-indicator');
const presets = require('loading-indicator/presets');
const meow = require('meow');
const emoji = require('node-emoji');
const chalk = require('chalk');
const inquirer = require('inquirer');

const cli = meow();
const username = cli.input[0];
const log = console.log;
let loadingIndicator;
let starredRepos = [];

loadingIndicator = loading.start(null, {
	frames: presets.dots
});

const customheaders = {
	'User-Agent': 'starg'
};

const github = new GitHubApi({
	protocol: 'https',
	host: 'api.github.com',
	headers: customheaders
});

let questions = [
	{
		type: 'list',
		name: 'openrepo',
		message: 'Do you want to open the repo in browser ?',
		choices: [
			{
				name: 'yes'
			},
			{
				name: 'no'
			}
		]
	}
];

if (username === undefined) {
	loading.stop(loadingIndicator);
	log('Please specify a valid GitHub username ' + emoji.get('disappointed_relieved'));
} else {
	github.activity.getStarredReposForUser({
		username: username
	}, function (error, res) {
		if (error) {
			console.error(error);
		}

		starredRepos = starredRepos.concat(res);

		if (github.hasNextPage(res)) {
			getNextPage(res);
		}
	});
}

function getNextPage(res) {
	github.getNextPage(res, customheaders, function (err, res) {
		if (err) {
			console.error('error :: ' + err);
		}

		starredRepos = starredRepos.concat(res);
		if (github.hasNextPage(res)) {
			getNextPage(res);
		} else {
			loading.stop(loadingIndicator);
			printOneRandomStarredRepo();
		}
	});
}

function printOneRandomStarredRepo() {
	let min = 0;
	let	max = starredRepos.length;
	let	random = Math.floor(Math.random() * (max - min)) + min;

	log(emoji.get('star') + '   ' + chalk.inverse(starredRepos[random].full_name));
	log('    description : ' + starredRepos[random].description);
	inquirer.prompt(questions).then(function (answers) {
		if (answers.openrepo === 'yes') {
			require('openurl').open(starredRepos[random].html_url);
		}
	});
}
