const axios = require('axios');

const DEFAULT_OPTIONS = {
	timeout: 5000
};

class Server {
	constructor(ip, port, errmsg, options) {
		if (!ip || !port) throw Error('Please provide an IP & Port.');

		this.ip = ip;
		this.port = port;	
		this.errmsg = errmsg || 'Error Occured';
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
				.catch((err) => {
					send(this.errmsg);
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
				.catch((err) => {
					send(this.errmsg);
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
				.catch((err) => {
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
				.catch((err) => {
					send(this.errmsg);
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
				.catch((err) => {
					send(this.errmsg);
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
				.catch((err) => {
					send(this.errmsg);
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
				.catch((err) => {
					send(this.errmsg);
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
				.catch((err) => {
					send(this.errmsg);
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
				.catch((err) => {
					send(this.errmsg);
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
				.catch((err) => {
					send(this.errmsg);
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
				.catch((err) => {
					send(this.errmsg);
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
				.catch((err) => {
					send(this.errmsg);
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
				.catch((err) => {
					send(this.errmsg);
				});
		});
	}

}

module.exports.Server = Server;