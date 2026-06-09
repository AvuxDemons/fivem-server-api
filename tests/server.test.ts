import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import axios from "axios";
import FiveM, { FiveMError } from "../src/index";

vi.mock("axios");
const mockedAxios = vi.mocked(axios);

const MOCK_INFO = {
	server: "xxx-endpoint",
	icon: "data:image/png;base64,abc",
	resources: ["es_extended", "mysql-async"],
	vars: {
		sv_projectName: "^1Test Server",
		sv_projectDesc: "A test server description",
		sv_maxClients: "64",
		onesync_enabled: "true",
		locale: "en-US",
		gamename: "gta5",
		sv_enforceGameBuild: "2944",
		sv_enhancedHostSupport: "true",
		sv_licenseKeyToken: "license-token-123",
		sv_scriptHookAllowed: "false",
		tags: "roleplay,pve",
	},
	requestSteamTicket: true,
	upvotePower: 42,
	ownerName: "TestOwner",
	ownerProfile: "https://forum.cfx.re/u/test",
	ownerAvatar: "https://example.com/avatar.png",
	players: [
		{ id: 0, identifiers: ["license:abc"], name: "Player1", ping: 25 },
	],
};

const MOCK_PLAYERS = [
	{ id: 0, identifiers: ["license:abc"], name: "Player1", ping: 25 },
	{ id: 1, identifiers: ["license:def"], name: "Player2", ping: 50 },
	{ id: 2, identifiers: ["license:ghi"], name: "Player3", ping: 75 },
];

describe("FiveMError", () => {
	it("should create error with proper shape", () => {
		const err = new FiveMError("Test error", {
			method: "getPlayers",
			url: "http://1.2.3.4/info.json",
			status: 500,
		});

		expect(err).toBeInstanceOf(Error);
		expect(err).toBeInstanceOf(FiveMError);
		expect(err.name).toBe("FiveMError");
		expect(err.message).toBe("Test error");
		expect(err.method).toBe("getPlayers");
		expect(err.url).toBe("http://1.2.3.4/info.json");
		expect(err.status).toBe(500);
	});

	it("should serialize to JSON", () => {
		const err = new FiveMError("Oops", { method: "cfxre", url: "https://cfx.re/join/xyz" });
		const json = err.toJSON();
		expect(json).toEqual({
			name: "FiveMError",
			message: "Oops",
			method: "cfxre",
			url: "https://cfx.re/join/xyz",
			status: undefined,
		});
	});

	it("should have cause when provided", () => {
		const cause = new Error("Underlying error");
		const err = new FiveMError("Wrapper", { method: "getInfo", cause });
		expect(err.cause).toBe(cause);
	});
});

describe("Server constructor validation", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should throw if no argument provided", () => {
		expect(() => new FiveM("")).toThrow(FiveMError);
		expect(() => new FiveM("")).toThrow("Please provide a valid");
	});

	it("should throw if input is empty string", () => {
		expect(() => new FiveM("   ")).toThrow(FiveMError);
	});

	it("should throw on invalid port", () => {
		expect(() => new FiveM("1.2.3.4:99999")).toThrow("Invalid port");
		expect(() => new FiveM("1.2.3.4:abc")).toThrow("Invalid port");
		expect(() => new FiveM("1.2.3.4:0")).toThrow("Invalid port");
		expect(() => new FiveM("1.2.3.4:-1")).toThrow("Invalid port");
	});

	it("should accept valid IP:Port", () => {
		const server = new FiveM("1.2.3.4:30120");
		expect(server.getIp()).toBe("1.2.3.4:30120");
	});

	it("should accept IP without port", () => {
		const server = new FiveM("1.2.3.4");
		expect(server.getIp()).toBe("1.2.3.4");
	});

	it("should accept domain:port", () => {
		const server = new FiveM("myserver.com:30120");
		expect(server.getIp()).toBe("myserver.com:30120");
	});

	it("should treat short code as CFX.re URL", () => {
		mockedAxios.get.mockResolvedValue({
			data: "",
			headers: { "x-citizenfx-url": "http://1.2.3.4:30120/" },
		});
		const server = new FiveM("my59jq");
		expect(server.getIp()).toBe("");
	});
});

describe("Server methods (IP:Port)", () => {
	let server: FiveM;

	beforeEach(() => {
		vi.resetAllMocks();
		server = new FiveM("1.2.3.4:30120");
	});

	it("should get player count", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_PLAYERS });
		const count = await server.getPlayers();
		expect(count).toBe(3);
	});

	it("should get all players", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_PLAYERS });
		const players = await server.getPlayersAll();
		expect(players).toEqual(MOCK_PLAYERS);
	});

	it("should get server info", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const info = await server.getServer();
		expect(info.vars.sv_projectName).toBe("^1Test Server");
	});

	it("should get server status (online)", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const status = await server.getServerStatus();
		expect(status).toBe(true);
	});

	it("should get server status (offline)", async () => {
		mockedAxios.get.mockRejectedValueOnce(new Error("Connection refused"));
		const status = await server.getServerStatus();
		expect(status).toBe(false);
	});

	it("should get server name with color code stripped", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const name = await server.getServerName();
		expect(name).toBe("Test Server");
	});

	it("should get server description", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const desc = await server.getServerDesc();
		expect(desc).toBe("A test server description");
	});

	it("should get max players", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const max = await server.getMaxPlayers();
		expect(max).toBe(64);
	});

	it("should get resources", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const resources = await server.getResources();
		expect(resources).toEqual(["es_extended", "mysql-async"]);
	});

	it("should get tags", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const tags = await server.getTags();
		expect(tags).toBe("roleplay,pve");
	});

	it("should get OneSync status", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const onesync = await server.getOnesync();
		expect(onesync).toBe(true);
	});

	it("should get locale", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const locale = await server.getLocale();
		expect(locale).toBe("en-US");
	});

	it("should get gamename", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const gamename = await server.getGamename();
		expect(gamename).toBe("gta5");
	});

	it("should get steam ticket requirement", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const steamTicket = await server.getSteamTicket();
		expect(steamTicket).toBe(true);
	});

	it("should get game build", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const build = await server.getGameBuild();
		expect(build).toBe(2944);
	});

	it("should get enhanced host support", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const ehs = await server.getEnhancedHostSupport();
		expect(ehs).toBe(true);
	});

	it("should get license key token", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const token = await server.getLicenseKeyToken();
		expect(token).toBe("license-token-123");
	});

	it("should get script hook allowed", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const allowed = await server.getScriptHookAllowed();
		expect(allowed).toBe(false);
	});

	it("should get endpoint", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const endpoint = await server.getEndpoint();
		expect(endpoint).toBe("xxx-endpoint");
	});

	it("should get icon", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const icon = await server.getIcon();
		expect(icon).toBe("data:image/png;base64,abc");
	});

	it("should get upvote power", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const power = await server.getUpvotePower();
		expect(power).toBe(42);
	});

	it("should get owner name", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const owner = await server.getOwnerName();
		expect(owner).toBe("TestOwner");
	});

	it("should get owner profile", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const profile = await server.getOwnerProfile();
		expect(profile).toBe("https://forum.cfx.re/u/test");
	});

	it("should get owner avatar", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: MOCK_INFO });
		const avatar = await server.getOwnerAvatar();
		expect(avatar).toBe("https://example.com/avatar.png");
	});

	it("should return IP", () => {
		expect(server.getIp()).toBe("1.2.3.4:30120");
	});
});

describe("Cache", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should cache info.json within TTL", async () => {
		mockedAxios.get.mockResolvedValue({ data: MOCK_INFO });
		const server = new FiveM("1.2.3.4:30120", { cacheTtl: 60000 });

		await server.getServer();
		await server.getResources();
		await server.getMaxPlayers();
		await server.getServerName();

		expect(mockedAxios.get).toHaveBeenCalledTimes(1);
	});

	it("should not cache info.json when cacheTtl is 0", async () => {
		mockedAxios.get.mockResolvedValue({ data: MOCK_INFO });
		const server = new FiveM("1.2.3.4:30120", { cacheTtl: 0 });

		await server.getServer();
		await server.getResources();

		expect(mockedAxios.get).toHaveBeenCalledTimes(2);
	});
});

describe("Error handling", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should throw FiveMError when server is unreachable for getPlayers", async () => {
		mockedAxios.get.mockRejectedValue(new Error("Network error"));
		const server = new FiveM("1.2.3.4:30120");

		await expect(server.getPlayers()).rejects.toThrow(FiveMError);
		await expect(server.getPlayers()).rejects.toThrow("Failed to fetch player count");
	});

	it("should throw FiveMError when server is unreachable for getServer", async () => {
		mockedAxios.get.mockRejectedValue(new Error("Network error"));
		const server = new FiveM("1.2.3.4:30120");

		await expect(server.getServer()).rejects.toThrow(FiveMError);
		await expect(server.getServer()).rejects.toThrow("Failed to fetch server info");
	});

	it("should throw FiveMError when players.json returns non-array", async () => {
		mockedAxios.get.mockResolvedValue({ data: { error: "invalid" } });
		const server = new FiveM("1.2.3.4:30120");

		await expect(server.getPlayers()).rejects.toThrow("Unexpected response from players.json");
	});

	it("should include cause in FiveMError", async () => {
		const originalError = new Error("Connection timeout");
		mockedAxios.get.mockRejectedValue(originalError);
		const server = new FiveM("1.2.3.4:30120");

		try {
			await server.getServer();
		} catch (err) {
			expect(err).toBeInstanceOf(FiveMError);
			expect((err as FiveMError).cause).toBe(originalError);
		}
	});
});

describe("Retry", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should retry on failure", async () => {
		mockedAxios.get
			.mockRejectedValueOnce(new Error("Attempt 1"))
			.mockRejectedValueOnce(new Error("Attempt 2"))
			.mockResolvedValueOnce({ data: MOCK_PLAYERS });

		const server = new FiveM("1.2.3.4:30120", {
			retries: 2,
			retryDelay: 10,
		});

		const count = await server.getPlayers();
		expect(count).toBe(3);
		expect(mockedAxios.get).toHaveBeenCalledTimes(3);
	});

	it("should throw after exhausting retries", async () => {
		mockedAxios.get.mockRejectedValue(new Error("Always fails"));
		const server = new FiveM("1.2.3.4:30120", {
			retries: 2,
			retryDelay: 10,
		});

		await expect(server.getPlayers()).rejects.toThrow(FiveMError);
		expect(mockedAxios.get).toHaveBeenCalledTimes(3);
	});

	it("should not retry by default", async () => {
		mockedAxios.get.mockRejectedValue(new Error("Fail"));
		const server = new FiveM("1.2.3.4:30120");

		await expect(server.getPlayers()).rejects.toThrow(FiveMError);
		expect(mockedAxios.get).toHaveBeenCalledTimes(1);
	});
});

describe("Options", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should use custom timeout", async () => {
		mockedAxios.get.mockResolvedValue({ data: MOCK_INFO });
		const server = new FiveM("1.2.3.4:30120", { timeout: 10000 });

		await server.getServer();
		expect(mockedAxios.get).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ timeout: 10000 }),
		);
	});

	it("should use default options when not provided", async () => {
		mockedAxios.get.mockResolvedValue({ data: MOCK_INFO });
		const server = new FiveM("1.2.3.4:30120");

		await server.getServer();
		expect(mockedAxios.get).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ timeout: 5000 }),
		);
	});
});

describe("getServerStatus edge cases", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should return false on any error type", async () => {
		const statuses = [new Error("ECONNREFUSED"), new Error("ETIMEDOUT"), new Error("ENOTFOUND")];

		for (const error of statuses) {
			mockedAxios.get.mockRejectedValueOnce(error);
			const server = new FiveM("1.2.3.4:30120");
			const status = await server.getServerStatus();
			expect(status).toBe(false);
		}
	});

	it("should not throw for offline server", async () => {
		mockedAxios.get.mockRejectedValue(new Error("Offline"));
		const server = new FiveM("1.2.3.4:30120");
		const status = await server.getServerStatus();
		expect(status).toBe(false);
	});
});

describe("Missing fields return defaults", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should return empty values for missing fields", async () => {
		mockedAxios.get.mockResolvedValue({ data: { vars: {} } });
		const server = new FiveM("1.2.3.4:30120");

		await expect(server.getServerName()).resolves.toBe("");
		await expect(server.getServerDesc()).resolves.toBe("");
		await expect(server.getMaxPlayers()).resolves.toBe(0);
		await expect(server.getResources()).resolves.toEqual([]);
		await expect(server.getTags()).resolves.toBe("");
		await expect(server.getOnesync()).resolves.toBe(false);
		await expect(server.getLocale()).resolves.toBe("");
		await expect(server.getGamename()).resolves.toBe("");
		await expect(server.getGameBuild()).resolves.toBe(0);
		await expect(server.getEnhancedHostSupport()).resolves.toBe(false);
		await expect(server.getLicenseKeyToken()).resolves.toBe("");
		await expect(server.getScriptHookAllowed()).resolves.toBe(false);
		await expect(server.getEndpoint()).resolves.toBeNull();
		await expect(server.getIcon()).resolves.toBe("");
		await expect(server.getUpvotePower()).resolves.toBe(0);
		await expect(server.getOwnerName()).resolves.toBe("");
		await expect(server.getOwnerProfile()).resolves.toBe("");
		await expect(server.getOwnerAvatar()).resolves.toBe("");
	});
});

describe("ready()", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should resolve immediately for IP:Port", async () => {
		const server = new FiveM("1.2.3.4:30120");
		await expect(server.ready()).resolves.toBeUndefined();
	});

	it("should wait for CFX.re resolution", async () => {
		mockedAxios.get.mockResolvedValue({
			data: "",
			headers: { "x-citizenfx-url": "http://5.6.7.8:30120/" },
		});
		const server = new FiveM("my59jq");
		await server.ready();
		expect(server.getIp()).toBe("5.6.7.8:30120");
	});

	it("should reject if CFX.re resolution fails", async () => {
		mockedAxios.get.mockRejectedValue(new Error("Network error"));
		const server = new FiveM("badcode");
		await expect(server.ready()).rejects.toThrow(FiveMError);
	});
});

describe("clearCache()", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should force re-fetch after clearing cache", async () => {
		mockedAxios.get.mockResolvedValue({ data: MOCK_INFO });
		const server = new FiveM("1.2.3.4:30120", { cacheTtl: 60000 });

		await server.getServer();
		expect(mockedAxios.get).toHaveBeenCalledTimes(1);

		// Should use cache — no extra call
		await server.getServerName();
		expect(mockedAxios.get).toHaveBeenCalledTimes(1);

		// Clear and re-fetch
		server.clearCache();
		await server.getServerName();
		expect(mockedAxios.get).toHaveBeenCalledTimes(2);
	});
});

describe("playerCount getter", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should return 0 initially", () => {
		const server = new FiveM("1.2.3.4:30120");
		expect(server.playerCount).toBe(0);
	});

	it("should update after getPlayers()", async () => {
		mockedAxios.get.mockResolvedValue({ data: MOCK_PLAYERS });
		const server = new FiveM("1.2.3.4:30120");

		await server.getPlayers();
		expect(server.playerCount).toBe(3);
	});

	it("should update after getPlayersAll()", async () => {
		mockedAxios.get.mockResolvedValue({ data: MOCK_PLAYERS });
		const server = new FiveM("1.2.3.4:30120");

		await server.getPlayersAll();
		expect(server.playerCount).toBe(3);
	});

	it("should update after getServer() when info contains players", async () => {
		mockedAxios.get.mockResolvedValue({ data: MOCK_INFO });
		const server = new FiveM("1.2.3.4:30120");

		await server.getServer();
		expect(server.playerCount).toBe(1);
	});
});

describe("getPlayer()", () => {
	const PLAYERS = [
		{ id: 42, identifiers: ["license:abc123", "steam:def456"], name: "TestPlayer", ping: 30 },
		{ id: 99, identifiers: ["license:xyz789"], name: "AnotherOne", ping: 50 },
		{ id: 7, identifiers: ["discord:111222"], name: "DiscordUser", ping: 20 },
	];

	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should find player by id (number)", async () => {
		mockedAxios.get.mockResolvedValue({ data: PLAYERS });
		const server = new FiveM("1.2.3.4:30120");

		const p = await server.getPlayer(42);
		expect(p).not.toBeNull();
		expect(p!.name).toBe("TestPlayer");
	});

	it("should return null if id not found", async () => {
		mockedAxios.get.mockResolvedValue({ data: PLAYERS });
		const server = new FiveM("1.2.3.4:30120");

		const p = await server.getPlayer(999);
		expect(p).toBeNull();
	});

	it("should find player by name substring", async () => {
		mockedAxios.get.mockResolvedValue({ data: PLAYERS });
		const server = new FiveM("1.2.3.4:30120");

		const p = await server.getPlayer("another");
		expect(p).not.toBeNull();
		expect(p!.name).toBe("AnotherOne");
	});

	it("should find player by identifier", async () => {
		mockedAxios.get.mockResolvedValue({ data: PLAYERS });
		const server = new FiveM("1.2.3.4:30120");

		const p = await server.getPlayer("license:abc123");
		expect(p).not.toBeNull();
		expect(p!.id).toBe(42);
	});

	it("should find player by discord identifier", async () => {
		mockedAxios.get.mockResolvedValue({ data: PLAYERS });
		const server = new FiveM("1.2.3.4:30120");

		const p = await server.getPlayer("discord:111222");
		expect(p).not.toBeNull();
		expect(p!.name).toBe("DiscordUser");
	});
});

describe("debug option", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should call debug function on requests", async () => {
		const logs: string[] = [];
		mockedAxios.get.mockResolvedValue({ data: MOCK_INFO });
		const server = new FiveM("1.2.3.4:30120", {
			debug: (msg) => logs.push(msg),
		});

		await server.getServer();
		expect(logs.some((l) => l.includes("GET"))).toBe(true);
		expect(logs.some((l) => l.includes("OK"))).toBe(true);
	});

	it("should log to console when debug is true", async () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => { });
		mockedAxios.get.mockResolvedValue({ data: MOCK_INFO });
		const server = new FiveM("1.2.3.4:30120", { debug: true });

		await server.getServer();
		expect(spy).toHaveBeenCalledWith(expect.stringContaining("[fivem-server-api]"));
		spy.mockRestore();
	});

	it("should not log when debug is false", async () => {
		const spy = vi.spyOn(console, "log").mockImplementation(() => { });
		mockedAxios.get.mockResolvedValue({ data: MOCK_INFO });
		const server = new FiveM("1.2.3.4:30120");

		await server.getServer();
		const apiCalls = spy.mock.calls.filter((c) =>
			typeof c[0] === "string" && c[0].includes("[fivem-server-api]"),
		);
		expect(apiCalls.length).toBe(0);
		spy.mockRestore();
	});
});

describe("watch()", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.resetAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should call callback at interval", async () => {
		mockedAxios.get.mockResolvedValue({ data: MOCK_INFO });
		const server = new FiveM("1.2.3.4:30120");
		const calls: number[] = [];

		const handle = server.watch(1000, (s) => {
			void calls.push(s.playerCount);
		});

		vi.advanceTimersByTime(3500);
		expect(calls.length).toBeGreaterThanOrEqual(3);
		handle.stop();
	});

	it("should stop calling after stop()", async () => {
		mockedAxios.get.mockResolvedValue({ data: MOCK_INFO });
		const server = new FiveM("1.2.3.4:30120");
		const calls: number[] = [];

		const handle = server.watch(1000, () => { void calls.push(1); });

		vi.advanceTimersByTime(2500);
		handle.stop();
		const countAfterStop = calls.length;

		vi.advanceTimersByTime(5000);
		expect(calls.length).toBe(countAfterStop);
	});

	it("should throw for interval < 100ms", () => {
		const server = new FiveM("1.2.3.4:30120");
		expect(() => server.watch(50, () => { })).toThrow(FiveMError);
	});
});

describe("Server.multi()", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should create multiple servers", async () => {
		mockedAxios.get.mockResolvedValue({ data: MOCK_INFO });
		const result = await FiveM.multi([
			{ cfxre: "1.2.3.4:30120" },
			{ cfxre: "5.6.7.8:30120" },
		]);

		expect(result.servers).toHaveLength(2);
		expect(result.servers[0].getIp()).toBe("1.2.3.4:30120");
		expect(result.servers[1].getIp()).toBe("5.6.7.8:30120");
	});

	it("should get all statuses", async () => {
		let callCount = 0;
		mockedAxios.get.mockImplementation(() => {
			callCount++;
			if (callCount % 2 === 1) return Promise.resolve({ data: MOCK_INFO });
			return Promise.reject(new Error("Offline"));
		});

		const result = await FiveM.multi([
			{ cfxre: "1.2.3.4:30120" },
			{ cfxre: "5.6.7.8:30120" },
		]);

		const statuses = await result.getAllStatus();
		expect(statuses.get("1.2.3.4:30120")).toBe(true);
		expect(statuses.get("5.6.7.8:30120")).toBe(false);
	});

	it("should get all player counts", async () => {
		mockedAxios.get.mockResolvedValue({ data: MOCK_PLAYERS });
		const result = await FiveM.multi([
			{ cfxre: "1.2.3.4:30120" },
			{ cfxre: "5.6.7.8:30120" },
		]);

		const players = await result.getAllPlayers();
		expect(players.get("1.2.3.4:30120")).toBe(3);
		expect(players.get("5.6.7.8:30120")).toBe(3);
	});

	it("should get online servers only", async () => {
		let callCount = 0;
		mockedAxios.get.mockImplementation(() => {
			callCount++;
			if (callCount === 1) return Promise.resolve({ data: MOCK_INFO });
			return Promise.reject(new Error("Offline"));
		});

		const result = await FiveM.multi([
			{ cfxre: "1.2.3.4:30120" },
			{ cfxre: "5.6.7.8:30120" },
		]);

		const online = await result.getOnlineServers();
		expect(online).toHaveLength(1);
	});

	it("should handle CFX.re URLs in multi", async () => {
		mockedAxios.get.mockResolvedValue({
			data: "",
			headers: { "x-citizenfx-url": "http://1.2.3.4:30120/" },
		});

		const result = await FiveM.multi([
			{ cfxre: "code1" },
			{ cfxre: "code2" },
		]);

		expect(result.servers).toHaveLength(2);
	});
});

const MOCK_DYNAMIC = {
	clients: 47,
	gametype: "Roleplay",
	hostname: "^3KISAH NUSANTARA ROLEPLAY",
	mapname: "San Andreas",
	sv_maxclients: "1000",
	iv: "1837349084",
};

describe("dynamic.json", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should get clients from dynamic.json", async () => {
		mockedAxios.get.mockImplementation((url: string) => {
			if ((url as string).includes("dynamic.json")) {
				return Promise.resolve({ data: MOCK_DYNAMIC });
			}
			return Promise.resolve({ data: MOCK_INFO });
		});
		const server = new FiveM("1.2.3.4:30120");
		const clients = await server.getClients();
		expect(clients).toBe(47);
	});

	it("should fallback to players.json when dynamic.json fails", async () => {
		mockedAxios.get.mockImplementation((url: string) => {
			if ((url as string).includes("dynamic.json")) {
				return Promise.reject(new Error("Forbidden"));
			}
			if ((url as string).includes("players.json")) {
				return Promise.resolve({ data: MOCK_PLAYERS });
			}
			return Promise.resolve({ data: MOCK_INFO });
		});
		const server = new FiveM("1.2.3.4:30120");
		const clients = await server.getClients();
		expect(clients).toBe(3);
	});

	it("should get hostname from dynamic.json", async () => {
		mockedAxios.get.mockImplementation((url: string) => {
			if ((url as string).includes("dynamic.json")) {
				return Promise.resolve({ data: MOCK_DYNAMIC });
			}
			return Promise.resolve({ data: MOCK_INFO });
		});
		const server = new FiveM("1.2.3.4:30120");
		const hostname = await server.getHostname();
		expect(hostname).toBe("^3KISAH NUSANTARA ROLEPLAY");
	});

	it("should fallback hostname to sv_projectName when dynamic.json fails", async () => {
		mockedAxios.get.mockImplementation((url: string) => {
			if ((url as string).includes("dynamic.json")) {
				return Promise.reject(new Error("Forbidden"));
			}
			return Promise.resolve({ data: MOCK_INFO });
		});
		const server = new FiveM("1.2.3.4:30120");
		const hostname = await server.getHostname();
		expect(hostname).toBe("^1Test Server");
	});

	it("should get gametype from dynamic.json", async () => {
		mockedAxios.get.mockImplementation((url: string) => {
			if ((url as string).includes("dynamic.json")) {
				return Promise.resolve({ data: MOCK_DYNAMIC });
			}
			return Promise.resolve({ data: MOCK_INFO });
		});
		const server = new FiveM("1.2.3.4:30120");
		expect(await server.getGametype()).toBe("Roleplay");
	});

	it("should return empty gametype when dynamic.json fails", async () => {
		mockedAxios.get.mockImplementation((url: string) => {
			if ((url as string).includes("dynamic.json")) {
				return Promise.reject(new Error("Forbidden"));
			}
			return Promise.resolve({ data: MOCK_INFO });
		});
		const server = new FiveM("1.2.3.4:30120");
		expect(await server.getGametype()).toBe("");
	});

	it("should get mapname from dynamic.json", async () => {
		mockedAxios.get.mockImplementation((url: string) => {
			if ((url as string).includes("dynamic.json")) {
				return Promise.resolve({ data: MOCK_DYNAMIC });
			}
			return Promise.resolve({ data: MOCK_INFO });
		});
		const server = new FiveM("1.2.3.4:30120");
		expect(await server.getMapname()).toBe("San Andreas");
	});

	it("should get sv_maxclients from dynamic.json", async () => {
		mockedAxios.get.mockImplementation((url: string) => {
			if ((url as string).includes("dynamic.json")) {
				return Promise.resolve({ data: MOCK_DYNAMIC });
			}
			return Promise.resolve({ data: MOCK_INFO });
		});
		const server = new FiveM("1.2.3.4:30120");
		expect(await server.getSvMaxclients()).toBe(1000);
	});

	it("should cache dynamic.json within TTL", async () => {
		mockedAxios.get.mockImplementation((url: string) => {
			if ((url as string).includes("dynamic.json")) {
				return Promise.resolve({ data: MOCK_DYNAMIC });
			}
			return Promise.resolve({ data: MOCK_INFO });
		});
		const server = new FiveM("1.2.3.4:30120", { cacheTtl: 60000 });

		await server.getClients();
		await server.getGametype();
		await server.getMapname();

		const dynamicCalls = mockedAxios.get.mock.calls.filter(
			(c) => typeof c[0] === "string" && (c[0] as string).includes("dynamic.json"),
		);
		expect(dynamicCalls.length).toBe(1);
	});
});
