const axios = require('axios');

const DEFAULT_OPTIONS = {
	timeout: 5000,
	errmsg: 'Error Occured'
};

class Server {
	constructor(cfxre, options) {
		if (!cfxre) throw Error('Please provide an CFX.re Url / IP:Port.');

		if (cfxre.includes(":")) {
			this.ip = cfxre;
			console.log('Connected to server:', this.ip);
		} else {
			this.cfxre(cfxre);
		}

		this.options = Object.assign(DEFAULT_OPTIONS, options);
	}

	async cfxre(url) {
		let request, modifiedUrl;
		if (url.startsWith("cfx.re/join/")) {
			request = "https://" + url;
			modifiedUrl = url;
		} else if (url.startsWith("https://cfx.re/join/")) {
			request = url;
			modifiedUrl = url.replace("https://", "");
		} else {
			request = "https://cfx.re/join/" + url;
			modifiedUrl = "cfx.re/join/" + url;
		}

		try {
			this.ip = (await axios.get(request)).headers["x-citizenfx-url"].replace("http://", "").replace("/", "");
			console.log('Connected to server :', this.ip);
		} catch (error) {
			console.log(error);
			return this.options.errmsg;
		}
	}

	getPlayers() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/players.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let players = body.data;
					send(players.length);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getPlayersAll() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/players.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let players = body.data;
					send(players);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getServerStatus() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
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
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let resources = body.data.resources;
					send(resources);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getOnesync() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let onesync = body.data.vars.onesync_enabled;
					send(onesync);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getMaxPlayers() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let maxClients = body.data.vars.sv_maxClients;
					send(maxClients);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getLocale() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let locale = body.data.vars.locale;
					send(locale);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getGamename() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let gamename = body.data.vars.gamename;
					send(gamename);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getSteamTicket() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let steamTicket = body.data.requestSteamTicket;
					send(steamTicket);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getGameBuild() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let gameBuild = body.data.vars.sv_enforceGameBuild;
					send(gameBuild);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getEnhancedHostSupport() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let enhancedHostSupport = body.data.vars.sv_enhancedHostSupport;
					send(enhancedHostSupport);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getlicenseKeyToken() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let licenseKeyToken = body.data.vars.sv_licenseKeyToken;
					send(licenseKeyToken);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getScriptHookAllowed() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let scriptHookAllowed = body.data.vars.sv_scriptHookAllowed;
					send(scriptHookAllowed);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getTags() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let tags = body.data.vars.tags;
					send(tags);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getServer() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let server = body.data;
					send(server);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getServerName() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let serverName = body.data.vars.sv_projectName;
					serverName = serverName.replace(/^\^\d+/, '');
					send(serverName);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

	getServerDesc() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/info.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let serverDesc = body.data.vars.sv_projectDesc;
					send(serverDesc);
				})
				.catch((err) => {
					send(this.options.errmsg);
				});
		});
	}

}

module.exports.Server = Server;