const axios = require('axios');

const DEFAULT_OPTIONS = {
	timeout: 5000
};

class Server {
	constructor(ip, port, errmsg, options) {
		if (!ip || !port) throw Error('Please provide an IP & Port.');

		this.ip = ip;
		this.port = port;
		this.errmsg = Object.assign("API Connection Failed", errmsg);
		this.options = Object.assign(DEFAULT_OPTIONS, options);
	}

	getPlayers() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/players.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let players = body.data;
					send(players.length);
				})
				.catch(function (err) {
					send(errmsg);
				});
		});
	}

	getPlayersAll() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/players.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let players = body.data;
					send(players);
				})
				.catch(function (err) {
					send(errmsg);
				});
		});
	}

	getServerStatus() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let server_status = {
						online: true,
					}
					send(server_status);
				})
				.catch(function (err) {
					let server_status = {
						online: false,
						url: err.config.url,
						method: err.config.method
					}
					if (err.response == undefined)
						send(server_status)
				});
		});
	}

	getResources() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let resources = body.data.resources;
					send(resources);
				})
				.catch(function (err) {
					send(errmsg);
				});
		});
	}

	getOnesync() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let onesync = body.data.vars.onesync_enabled;
					send(onesync);
				})
				.catch(function (err) {
					send(errmsg);
				});
		});
	}

	getMaxPlayers() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let maxClients = body.data.vars.sv_maxClients;
					send(maxClients);
				})
				.catch(function (err) {
					send(errmsg);
				});
		});
	}

	getLocale() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let locale = body.data.vars.locale;
					send(locale);
				})
				.catch(function (err) {
					send(errmsg);
				});
		});
	}

	getGamename() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let gamename = body.data.vars.gamename;
					send(gamename);
				})
				.catch(function (err) {
					send(errmsg);
				});
		});
	}

	getEnhancedHostSupport() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let enhancedHostSupport = body.data.vars.sv_enhancedHostSupport;
					send(enhancedHostSupport);
				})
				.catch(function (err) {
					send(errmsg);
				});
		});
	}

	getlicenseKeyToken() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let licenseKeyToken = body.data.vars.sv_licenseKeyToken;
					send(licenseKeyToken);
				})
				.catch(function (err) {
					send(errmsg);
				});
		});
	}

	getScriptHookAllowed() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let scriptHookAllowed = body.data.vars.sv_scriptHookAllowed;
					send(scriptHookAllowed);
				})
				.catch(function (err) {
					send(errmsg);
				});
		});
	}

	getTags() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let tags = body.data.vars.tags;
					send(tags);
				})
				.catch(function (err) {
					send(errmsg);
				});
		});
	}

	getServer() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}:${this.port}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let server = body.data;
					send(server);
				})
				.catch(function (err) {
					send(errmsg);
				});
		});
	}

}

module.exports.Server = Server;