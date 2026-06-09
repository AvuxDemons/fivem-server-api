#!/usr/bin/env node
'use strict';

const Server = require('../dist/cjs/index.js').default;

const args = process.argv.slice(2);
const json = args.includes('--json') || args.includes('-j');
const timeoutIdx = args.findIndex((a) => a.startsWith('--timeout='));
const timeout = timeoutIdx >= 0 ? parseInt(args[timeoutIdx].split('=')[1], 10) : 10000;
const input = args.find((a) => !a.startsWith('--') && a !== '-j') || '';

if (!input) {
	console.log('Usage: npx fivem-server-api <cfx.re-url | ip:port> [--json] [--timeout=5000]');
	console.log('Example: npx fivem-server-api cfx.re/join/my59jq');
	console.log('Example: npx fivem-server-api 1.2.3.4:30120 --json');
	process.exit(1);
}

async function main() {
	const server = new Server(input, { timeout, debug: !!process.env.DEBUG });

	const online = await server.getServerStatus();
	if (!online) {
		const result = { status: 'offline' };
		console.log(json ? JSON.stringify(result) : 'Server offline');
		process.exit(0);
	}

	const info = await server.getServer();
	const name = (info.vars && info.vars.sv_projectName || '').replace(/^\^\d+/, '');
	const desc = (info.vars && info.vars.sv_projectDesc) || '';
	const locale = (info.vars && info.vars.locale) || '';
	const gamename = (info.vars && info.vars.gamename) || '';
	const build = Number((info.vars && info.vars.sv_enforceGameBuild) || 0);
	const max = Number((info.vars && info.vars.sv_maxClients) || 0);
	const tags = (info.vars && info.vars.tags) || '';
	const onesync = (info.vars && info.vars.onesync_enabled) === 'true';
	const resources = info.resources || [];
	const endpoint = info.server || null;
	const icon = info.icon || '';
	const upvote = Number(info.upvotePower || 0);
	const owner = String(info.ownerName || '');

	const count = await server.getPlayers();
	const players = await server.getPlayersAll();

	if (json) {
		console.log(JSON.stringify({
			ip: server.getIp(),
			status: 'online',
			name, desc, locale, gamename, build,
			maxPlayers: max, tags, onesync,
			resourceCount: resources.length, endpoint,
			hasIcon: icon.length > 0, upvotePower: upvote, ownerName: owner,
			playerCount: count,
			players: players.slice(0, 20).map((p) => ({ id: p.id, name: p.name, ping: p.ping })),
			shownPlayers: Math.min(players.length, 20),
			totalPlayers: players.length,
		}, null, 2));
	} else {
		console.log('IP:        ' + server.getIp());
		console.log('Name:      ' + name);
		console.log('Desc:      ' + desc);
		console.log('Game:      ' + gamename + ' | Build: ' + build + ' | Locale: ' + locale);
		console.log('Max:       ' + max + ' | Online: ' + count);
		console.log('Tags:      ' + tags);
		console.log('OneSync:   ' + onesync);
		console.log('Resources: ' + resources.length);
		console.log('Endpoint:  ' + (endpoint || 'none'));
		console.log('Owner:     ' + (owner || 'unknown'));
		console.log('Upvote:    ' + upvote);
		console.log('Players:');
		for (const p of players.slice(0, 20)) {
			console.log('  #' + String(p.id).padEnd(6) + ' ' + p.name.padEnd(24) + ' ping: ' + p.ping);
		}
		if (players.length > 20) console.log('  ... and ' + (players.length - 20) + ' more');
	}
}

main().catch((err) => {
	console.error('Error:', err.message);
	if (process.env.DEBUG) console.error(err.stack);
	process.exit(1);
});
