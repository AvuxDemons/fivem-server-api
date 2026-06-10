import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { FiveMError } from "./errors.js";
import type { Player, ServerInfo, ServerOptions, DynamicInfo, WatchHandle, MultiServerConfig } from "./types.js";

const DEFAULT_OPTIONS: Required<ServerOptions> = {
	timeout: 5000,
	retries: 0,
	retryDelay: 1000,
	cacheTtl: 5000,
	debug: false,
	minInterval: 0,
};

export { FiveMError } from "./errors.js";
export {
	searchServers,
	getAllServers,
	getServerByEndpoint,
	getServersByLocale,
} from "./search.js";
export type {
	SearchFilter,
	SearchPlayer,
	SearchServerData,
	SearchResult,
} from "./search.js";
export type { Player, ServerInfo, DynamicInfo, ServerOptions, WatchHandle, MultiServerConfig } from "./types.js";

export default class Server {
	#ip = "";
	#ready: Promise<void>;
	#options: Required<ServerOptions>;
	#logger: ((msg: string) => void) | null = null;
	#infoCache: { data: ServerInfo; timestamp: number } | null = null;
	#dynamicCache: { data: DynamicInfo; timestamp: number } | null = null;
	#lastPlayerCount = 0;
	#lastRequestTime = 0;

	constructor(cfxre: string, options: ServerOptions = {}) {
		if (!cfxre || typeof cfxre !== "string" || !cfxre.trim()) {
			throw new FiveMError(
				"Please provide a valid CFX.re URL or IP:Port.",
				{ method: "constructor" },
			);
		}

		this.#options = { ...DEFAULT_OPTIONS, ...options };

		if (this.#options.debug) {
			this.#logger = typeof this.#options.debug === "function"
				? this.#options.debug
				: (msg: string) => console.log(`[fivem-server-api] ${msg}`);
		}

		const input = cfxre.trim();
		if (this.#isCfxreUrl(input)) {
			this.#ready = this.#resolveCfxre(input);
		} else {
			this.#validateIpPort(input);
			this.#ip = input;
			this.#ready = Promise.resolve();
		}
	}

	ready(): Promise<void> {
		return this.#ready;
	}

	clearCache(): void {
		this.#infoCache = null;
		this.#dynamicCache = null;
		this.#log("Cache cleared");
	}

	get playerCount(): number {
		return this.#lastPlayerCount;
	}

	#isCfxreUrl(input: string): boolean {
		if (input.startsWith("cfx.re") || input.startsWith("https://cfx.re")) {
			return true;
		}
		if (!input.includes(".") && !input.includes(":")) {
			return true;
		}
		return false;
	}

	#validateIpPort(input: string): void {
		const colonIndex = input.lastIndexOf(":");
		const portStr = colonIndex > 0 ? input.slice(colonIndex + 1) : "";

		if (colonIndex > 0) {
			const port = Number(portStr);
			if (portStr === "" || !Number.isInteger(port) || port < 1 || port > 65535) {
				throw new FiveMError(
					`Invalid port "${portStr}" in "${input}". Port must be 1–65535.`,
					{ method: "constructor" },
				);
			}
		}
	}

	#log(msg: string): void {
		this.#logger?.(msg);
	}

	async #resolveCfxre(input: string): Promise<void> {
		let url: string;
		if (input.startsWith("cfx.re/join/")) {
			url = "https://" + input;
		} else if (input.startsWith("https://cfx.re/join/")) {
			url = input;
		} else {
			url = "https://cfx.re/join/" + input;
		}

		this.#log(`Resolving CFX.re: ${url}`);

		let response: AxiosResponse;
		try {
			response = await axios.get(url, {
				timeout: this.#options.timeout,
				responseType: "text",
			});
		} catch (err: unknown) {
			throw new FiveMError(
				`Failed to resolve CFX.re URL "${input}". The server may be offline or the code is invalid.`,
				{ method: "cfxre", url, cause: err },
			);
		}

		const citizenUrl: string | undefined = response?.headers?.["x-citizenfx-url"];
		if (!citizenUrl) {
			throw new FiveMError(
				`No x-citizenfx-url header in response for "${input}". Please verify the URL.`,
				{ method: "cfxre", url },
			);
		}

		try {
			const parsed = new URL(citizenUrl);
			this.#ip = parsed.host;
			this.#log(`Resolved to: ${this.#ip}`);
		} catch {
			throw new FiveMError(
				`Failed to parse server address "${citizenUrl}" from CFX.re header.`,
				{ method: "cfxre", url },
			);
		}
	}

	async #throttle(): Promise<void> {
		if (this.#options.minInterval <= 0) return;
		const elapsed = Date.now() - this.#lastRequestTime;
		if (elapsed < this.#options.minInterval) {
			const delay = this.#options.minInterval - elapsed;
			this.#log(`Throttling: waiting ${delay}ms`);
			await new Promise((r) => setTimeout(r, delay));
		}
	}

	async #fetch(url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse> {
		await this.#throttle();

		const maxAttempts = this.#options.retries + 1;
		let lastError: unknown;

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			try {
				this.#log(`GET ${url}${attempt > 0 ? ` (retry ${attempt})` : ""}`);
				const response = await axios.get(url, {
					timeout: this.#options.timeout,
					responseType: "json",
					...config,
				});
				this.#lastRequestTime = Date.now();
				this.#log(`OK ${url} (${JSON.stringify(response.data).length} bytes)`);
				return response;
			} catch (err: unknown) {
				lastError = err;
				this.#log(`FAIL ${url}: ${(err as Error).message}`);
				if (attempt < maxAttempts - 1) {
					await new Promise((r) => setTimeout(r, this.#options.retryDelay));
				}
			}
		}
		throw lastError;
	}

	async #getInfo(): Promise<ServerInfo> {
		await this.#ready;

		if (this.#infoCache && Date.now() - this.#infoCache.timestamp < this.#options.cacheTtl) {
			return this.#infoCache.data;
		}

		try {
			const response = await this.#fetch(`http://${this.#ip}/info.json`);
			this.#infoCache = { data: response.data as ServerInfo, timestamp: Date.now() };
			if (Array.isArray(response.data?.players)) {
				this.#lastPlayerCount = response.data.players.length;
			}
			return this.#infoCache.data;
		} catch (err: unknown) {
			throw new FiveMError(
				"Failed to fetch server info.",
				{ method: "getInfo", url: `http://${this.#ip}/info.json`, cause: err },
			);
		}
	}

	async #getDynamic(): Promise<DynamicInfo | null> {
		await this.#ready;

		if (this.#dynamicCache && Date.now() - this.#dynamicCache.timestamp < this.#options.cacheTtl) {
			return this.#dynamicCache.data;
		}

		try {
			const response = await this.#fetch(`http://${this.#ip}/dynamic.json`);
			this.#dynamicCache = { data: response.data as DynamicInfo, timestamp: Date.now() };
			return this.#dynamicCache.data;
		} catch {
			this.#dynamicCache = null;
			return null;
		}
	}

	#getField(obj: Record<string, unknown>, path: string): unknown {
		const keys = path.split(".");
		let current: unknown = obj;
		for (const key of keys) {
			if (current && typeof current === "object") {
				current = (current as Record<string, unknown>)[key];
			} else {
				return undefined;
			}
		}
		return current;
	}

	async getServerStatus(): Promise<boolean> {
		try {
			await this.#ready;
			await this.#fetch(`http://${this.#ip}/info.json`);
			return true;
		} catch {
			return false;
		}
	}

	async getServer(): Promise<ServerInfo> {
		return this.#getInfo();
	}

	async getServerName(): Promise<string> {
		const info = await this.#getInfo();
		const name = this.#getField(info, "vars.sv_projectName") as string | undefined;
		return name?.replace(/^\^\d+/, "") || "";
	}

	async getServerDesc(): Promise<string> {
		const info = await this.#getInfo();
		return (this.#getField(info, "vars.sv_projectDesc") as string) || "";
	}

	async getPlayers(): Promise<number> {
		try {
			await this.#ready;
			const response = await this.#fetch(`http://${this.#ip}/players.json`);
			if (!Array.isArray(response.data)) {
				throw new FiveMError(
					"Unexpected response from players.json: expected an array.",
					{ method: "getPlayers", url: `http://${this.#ip}/players.json` },
				);
			}
			this.#lastPlayerCount = response.data.length;
			return this.#lastPlayerCount;
		} catch (err: unknown) {
			if (err instanceof FiveMError) throw err;
			throw new FiveMError(
				"Failed to fetch player count.",
				{ method: "getPlayers", url: `http://${this.#ip}/players.json`, cause: err },
			);
		}
	}

	async getPlayersAll(): Promise<Player[]> {
		try {
			await this.#ready;
			const response = await this.#fetch(`http://${this.#ip}/players.json`);
			if (!Array.isArray(response.data)) {
				throw new FiveMError(
					"Unexpected response from players.json: expected an array.",
					{ method: "getPlayersAll", url: `http://${this.#ip}/players.json` },
				);
			}
			const players = response.data as Player[];
			this.#lastPlayerCount = players.length;
			return players;
		} catch (err: unknown) {
			if (err instanceof FiveMError) throw err;
			throw new FiveMError(
				"Failed to fetch player list.",
				{ method: "getPlayersAll", url: `http://${this.#ip}/players.json`, cause: err },
			);
		}
	}

	async getPlayer(query: string | number): Promise<Player | null> {
		const players = await this.getPlayersAll();

		if (typeof query === "number") {
			return players.find((p) => p.id === query) ?? null;
		}

		const lower = query.toLowerCase();
		const idPrefixes = ["license:", "steam:", "discord:", "fivem:", "xbl:"];
		if (idPrefixes.some((pfx) => lower.startsWith(pfx))) {
			return players.find((p) =>
				p.identifiers.some((id) => id.toLowerCase() === lower),
			) ?? null;
		}

		return players.find((p) => p.name.toLowerCase().includes(lower)) ?? null;
	}

	async getMaxPlayers(): Promise<number> {
		return Number((await this.#getInfo()).vars?.sv_maxClients || 0);
	}

	async getResources(): Promise<string[]> {
		return (await this.#getInfo()).resources || [];
	}

	async getTags(): Promise<string> {
		return (await this.#getInfo()).vars?.tags || "";
	}

	async getOnesync(): Promise<boolean> {
		return (await this.#getInfo()).vars?.onesync_enabled === "true";
	}

	async getLocale(): Promise<string> {
		return (await this.#getInfo()).vars?.locale || "";
	}

	async getGamename(): Promise<string> {
		return (await this.#getInfo()).vars?.gamename || "";
	}

	async getSteamTicket(): Promise<boolean> {
		return Boolean((await this.#getInfo()).requestSteamTicket);
	}

	async getGameBuild(): Promise<number> {
		return Number((await this.#getInfo()).vars?.sv_enforceGameBuild || 0);
	}

	async getEnhancedHostSupport(): Promise<boolean> {
		return (await this.#getInfo()).vars?.sv_enhancedHostSupport === "true";
	}

	async getLicenseKeyToken(): Promise<string> {
		return (await this.#getInfo()).vars?.sv_licenseKeyToken || "";
	}

	async getScriptHookAllowed(): Promise<boolean> {
		return (await this.#getInfo()).vars?.sv_scriptHookAllowed === "true";
	}

	async getEndpoint(): Promise<string | null> {
		return (await this.#getInfo()).server || null;
	}

	async getIcon(): Promise<string> {
		return (await this.#getInfo()).icon || "";
	}

	async getUpvotePower(): Promise<number> {
		return Number((await this.#getInfo()).upvotePower || 0);
	}

	async getBurstPower(): Promise<number> {
		return Number((await this.#getInfo()).boostPower || 0);
	}

	async getClients(): Promise<number> {
		const dynamic = await this.#getDynamic();
		if (dynamic) return dynamic.clients;

		this.#log("dynamic.json unavailable, falling back to players.json");
		return this.getPlayers();
	}

	async getHostname(): Promise<string> {
		const dynamic = await this.#getDynamic();
		if (dynamic) return dynamic.hostname;

		const info = await this.#getInfo();
		return (this.#getField(info, "vars.sv_projectName") as string) || "";
	}

	async getGametype(): Promise<string> {
		const dynamic = await this.#getDynamic();
		if (dynamic) return dynamic.gametype;
		return "";
	}

	async getMapname(): Promise<string> {
		const dynamic = await this.#getDynamic();
		if (dynamic) return dynamic.mapname;
		return "";
	}

	async getSvMaxclients(): Promise<number> {
		const dynamic = await this.#getDynamic();
		if (dynamic) return Number(dynamic.sv_maxclients) || 0;

		return Number((await this.#getInfo()).vars?.sv_maxClients || 0);
	}

	async getOwnerName(): Promise<string> {
		return ((await this.#getInfo()).ownerName as string) || "";
	}

	async getOwnerProfile(): Promise<string> {
		return ((await this.#getInfo()).ownerProfile as string) || "";
	}

	async getOwnerAvatar(): Promise<string> {
		return ((await this.#getInfo()).ownerAvatar as string) || "";
	}

	getIp(): string {
		return this.#ip;
	}

	watch(intervalMs: number, callback: (server: Server) => void | Promise<void>): WatchHandle {
		if (intervalMs < 100) {
			throw new FiveMError(
				"Watch interval must be at least 100ms.",
				{ method: "watch" },
			);
		}

		const id = setInterval(() => {
			callback(this);
		}, intervalMs);

		return {
			stop() {
				clearInterval(id);
			},
		};
	}

	static async multi(configs: MultiServerConfig[]): Promise<{
		servers: Server[];
		getAllStatus(): Promise<Map<string, boolean>>;
		getAllPlayers(): Promise<Map<string, number>>;
		getOnlineServers(): Promise<Server[]>;
	}> {
		const servers = configs.map((c) => new Server(c.cfxre, c.options));

		await Promise.allSettled(servers.map((s) => s.ready()));

		return {
			servers,

			async getAllStatus() {
				const map = new Map<string, boolean>();
				const results = await Promise.allSettled(
					servers.map(async (s) => {
						const ip = s.getIp();
						const status = await s.getServerStatus();
						map.set(ip, status);
					}),
				);
				for (const [i, r] of results.entries()) {
					if (r.status === "rejected") {
						map.set(servers[i].getIp() || configs[i].cfxre, false);
					}
				}
				return map;
			},

			async getAllPlayers() {
				const map = new Map<string, number>();
				const results = await Promise.allSettled(
					servers.map(async (s) => {
						const ip = s.getIp();
						const count = await s.getPlayers();
						map.set(ip, count);
					}),
				);
				for (const [i, r] of results.entries()) {
					if (r.status === "rejected") {
						map.set(servers[i].getIp() || configs[i].cfxre, -1);
					}
				}
				return map;
			},

			async getOnlineServers() {
				const results = await Promise.allSettled(
					servers.map(async (s) => {
						const status = await s.getServerStatus();
						return status ? s : null;
					}),
				);
				return results
					.filter((r) => r.status === "fulfilled" && r.value !== null)
					.map((r) => (r as PromiseFulfilledResult<Server>).value);
			},
		};
	}
}
