const axios = require("axios");

const DEFAULT_OPTIONS = {
    timeout: 30000,
    errmsg: "Error Occurred",
};

class Server {
    constructor(cfxre, options = {}) {
        if (!cfxre) throw Error("Please provide a CFX.re URL / IP:Port.");

        this.options = { ...DEFAULT_OPTIONS, ...options };

        if (cfxre.includes(":")) {
            // Direct IP or IP:Port provided
            this.ip = cfxre;
            console.log("Connected to server:", this.ip);
        } else {
            // Handle CFX.re URL
            this.initializeCfxre(cfxre);
        }
    }

    async initializeCfxre(cfxre) {
        await this.cfxre(cfxre);
        if (!this.ip) {
            throw Error("Failed to initialize server IP from CFX.re URL.");
        }
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
            const response = await axios.get(request);
            this.ip = response.headers["x-citizenfx-url"]
                .replace("http://", "")
                .replace("/", "");
            console.log("Connected to server:", this.ip);
        } catch (err) {
            console.error("Error fetching CFX.re URL:", err);
            return this.options.errmsg;
        }
    }

    async getPlayers() {
        if (!this.ip) throw new Error("Server IP is not initialized.");
        try {
            const response = await axios.get(`http://${this.ip}/players.json`, {
                timeout: this.options.timeout,
            });
            return response.data.length;
        } catch (err) {
            console.error("Error fetching players:", err);
            return this.options.errmsg;
        }
    }

    async getPlayersAll() {
        if (!this.ip) throw new Error("Server IP is not initialized.");
        try {
            const response = await axios.get(`http://${this.ip}/players.json`, {
                timeout: this.options.timeout,
            });
            return response.data;
        } catch (err) {
            console.error("Error fetching all players:", err);
            return this.options.errmsg;
        }
    }

    async getServerStatus() {
        if (!this.ip) throw new Error("Server IP is not initialized.");
        try {
            await axios.get(`http://${this.ip}/info.json`, {
                timeout: this.options.timeout,
            });
            return { online: true };
        } catch (err) {
            console.error("Error fetching server status:", err);
            return {
                online: false,
                url: err.config?.url,
                method: err.config?.method,
            };
        }
    }

    async getResources() {
        return this.getInfoField("resources");
    }

    async getOnesync() {
        return this.getInfoField("vars.onesync_enabled");
    }

    async getMaxPlayers() {
        return this.getInfoField("vars.sv_maxClients");
    }

    async getLocale() {
        return this.getInfoField("vars.locale");
    }

    async getGamename() {
        return this.getInfoField("vars.gamename");
    }

    async getSteamTicket() {
        return this.getInfoField("requestSteamTicket");
    }

    async getGameBuild() {
        return this.getInfoField("vars.sv_enforceGameBuild");
    }

    async getEnhancedHostSupport() {
        return this.getInfoField("vars.sv_enhancedHostSupport");
    }

    async getLicenseKeyToken() {
        return this.getInfoField("vars.sv_licenseKeyToken");
    }

    async getScriptHookAllowed() {
        return this.getInfoField("vars.sv_scriptHookAllowed");
    }

    async getTags() {
        return this.getInfoField("vars.tags");
    }

    async getServer() {
        if (!this.ip) throw new Error("Server IP is not initialized.");
        try {
            const response = await axios.get(`http://${this.ip}/info.json`, {
                timeout: this.options.timeout,
            });
            return response.data;
        } catch (err) {
            console.error("Error fetching server info:", err);
            return this.options.errmsg;
        }
    }

    async getServerName() {
        const serverName = await this.getInfoField("vars.sv_projectName");
        return serverName?.replace(/^\^\d+/, "") || this.options.errmsg;
    }

    async getServerDesc() {
        return this.getInfoField("vars.sv_projectDesc");
    }

    async getInfoField(field) {
        if (!this.ip) throw new Error("Server IP is not initialized.");
        try {
            const response = await axios.get(`http://${this.ip}/info.json`, {
                timeout: this.options.timeout,
            });
            return field.split(".").reduce((obj, key) => obj?.[key], response.data);
        } catch (err) {
            console.error(`Error fetching field ${field}:`, err);
            return this.options.errmsg;
        }
    }
}

module.exports = Server;