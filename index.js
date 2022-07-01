const axios = require('axios');

const DEFAULT_OPTIONS = {
	timeout: 5000
};

class Server {
	constructor(ip, options) {
		if (!ip) throw Error('Please provide an IP.');

		this.ip = ip;
		this.options = Object.assign(DEFAULT_OPTIONS, options);
	}

	getPlayers() {
		return new Promise((send, err) => {
			axios
				.get(`http://${this.ip}/players.json`, { timeout: this.options.timeout })
				.then(function (body) {
					let players = body.data;
					send(players.length);
				})
				.catch(function (error) {
					let err = 'Something went wrong. Please try again later';
					send(err);
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
				.catch(function (error) {
					let err = 'Something went wrong. Please try again later';
					send(err);
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
				.catch(function (error) {
					let server_status = {
						online: false,
						url: error.config.url,
						method: error.config.method
					}
					if (error.response == undefined) send(server_status)
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
				.catch(function (error) {
					let err = 'Something went wrong. Please try again later';
					send(err);
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
				.catch(function (error) {
					let err = 'Something went wrong. Please try again later';
					send(err);
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
				.catch(function (error) {
					let err = 'Something went wrong. Please try again later';
					send(err);
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
				.catch(function (error) {
					let err = 'Something went wrong. Please try again later';
					send(err);
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
				.catch(function (error) {
					let err = 'Something went wrong. Please try again later';
					send(err);
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
				.catch(function (error) {
					let err = 'Something went wrong. Please try again later';
					send(err);
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
				.catch(function (error) {
					let err = 'Something went wrong. Please try again later';
					send(err);
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
				.catch(function (error) {
					let err = 'Something went wrong. Please try again later';
					send(err);
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
				.catch(function (error) {
					let err = 'Something went wrong. Please try again later';
					send(err);
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
				.catch(function (error) {
					let err = 'Something went wrong. Please try again later';
					send(err);
				});
		});
	}
	
}

module.exports.Server = Server;
