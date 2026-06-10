import protobuf from "protobufjs";
import { FiveMError } from "./errors.js";

const CFX_SERVERS_URL = "https://frontend.cfx-services.net/api/servers/streamRedir/";

const PROTO_SCHEMA = `
syntax = "proto3";
package master;
message Player {
  string name = 1;
  repeated string identifiers = 2;
  string endpoint = 3;
  int32 ping = 4;
  int32 id = 5;
}
message ServerData {
  int32 svMaxclients = 1;
  int32 clients = 2;
  int32 protocol = 3;
  string hostname = 4;
  string gametype = 5;
  string mapname = 6;
  repeated string resources = 8;
  string server = 9;
  repeated Player players = 10;
  int32 iconVersion = 11;
  map<string, string> vars = 12;
  bool enhancedHostSupport = 16;
  int32 upvotePower = 17;
  repeated string connectEndPoints = 18;
  int32 burstPower = 19;
}
message Server {
  string EndPoint = 1;
  ServerData Data = 2;
}
`;

export interface SearchFilter {
	query?: string;
	locale?: string;
	hostname?: string;
	gametype?: string;
	mapname?: string;
	tag?: string;
}

export interface SearchPlayer {
	name: string;
	identifiers: string[];
	endpoint: string;
	ping: number;
	id: number;
}

export interface SearchServerData {
	svMaxclients: number;
	clients: number;
	protocol: number;
	hostname: string;
	gametype: string;
	mapname: string;
	resources: string[];
	server: string;
	players: SearchPlayer[];
	iconVersion: number;
	vars: Record<string, string>;
	enhancedHostSupport: boolean;
	upvotePower: number;
	burstPower: number;
	connectEndPoints: string[];
}

export interface SearchResult {
	EndPoint: string;
	Data: SearchServerData;
}

let ServerType: protobuf.Type;

function getServerType(): protobuf.Type {
	if (!ServerType) {
		const root = protobuf.parse(PROTO_SCHEMA).root;
		ServerType = root.lookupType("master.Server");
	}
	return ServerType;
}

async function fetchAllServers(timeout = 30000, debug?: (msg: string) => void): Promise<SearchResult[]> {
	const controller = new AbortController();
	let timerId: ReturnType<typeof setTimeout> | undefined;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timerId = setTimeout(() => {
			controller.abort();
			reject(new FiveMError("Request timed out", { method: "searchServers", url: CFX_SERVERS_URL }));
		}, timeout);
	});

	try {
		debug?.("Fetching server list from Cfx.re...");
		const response = await Promise.race([
			fetch(CFX_SERVERS_URL, {
				signal: controller.signal,
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
					"Accept": "*/*",
					"Accept-Encoding": "gzip, deflate, br, zstd",
					"Accept-Language": "en-US,en;q=0.6",
					"Origin": "https://servers.fivem.net",
					"Referer": "https://servers.fivem.net/",
					"Cache-Control": "no-cache, no-store",
				},
			}),
			timeoutPromise,
		]);

		if (!response.ok) {
			throw new FiveMError(
				`Cfx.re returned status ${response.status}`,
				{ method: "searchServers", url: CFX_SERVERS_URL, status: response.status },
			);
		}

		debug?.("Downloading server data...");
		const buf = await Promise.race([response.arrayBuffer(), timeoutPromise]);
		debug?.(`Downloaded ${(buf.byteLength / 1024 / 1024).toFixed(1)} MB`);

		const servers: SearchResult[] = [];
		const decode = getServerType();
		const array = new Uint8Array(buf);
		let pos = 0;

		while (pos + 4 <= array.length) {
			const frameLength = (array[pos] | (array[pos + 1] << 8) | (array[pos + 2] << 16) | (array[pos + 3] << 24)) >>> 0;
			pos += 4;

			if (frameLength > 65535 || pos + frameLength > array.length) break;

			const frame = array.subarray(pos, pos + frameLength);
			pos += frameLength;

			try {
				const decoded = decode.decode(frame) as unknown as SearchResult;
				servers.push(decoded);
			} catch {
				// skip malformed frames
			}
		}

		debug?.(`Decoded ${servers.length} servers`);
		return servers;
	} catch (err: unknown) {
		if (err instanceof FiveMError) throw err;
		throw new FiveMError(
			"Failed to fetch server list from Cfx.re",
			{ method: "searchServers", url: CFX_SERVERS_URL, cause: err },
		);
	} finally {
		if (timerId) clearTimeout(timerId);
		controller.abort();
	}
}

/**
 * Search FiveM servers from the Cfx.re global server list.
 *
 * @param filter - Filter criteria (locale, hostname, gametype, mapname, tag)
 * @param limit - Maximum number of results to return (0 = unlimited)
 * @param timeout - Request timeout in ms (default: 30000)
 * @returns Matching servers (resolved to plain objects)
 */
export async function searchServers(
	filter?: SearchFilter,
	limit?: number,
	timeout?: number,
): Promise<SearchResult[]> {
	const servers = await fetchAllServers(timeout);

	let results = servers;

	if (filter) {
		if (filter.query) {
			const target = filter.query.toLowerCase();
			results = results.filter((s) => {
				const d = s.Data;
				return (
					(d?.hostname || "").toLowerCase().includes(target) ||
					(d?.vars?.sv_projectName || "").toLowerCase().includes(target) ||
					(d?.vars?.tags || "").toLowerCase().includes(target) ||
					(d?.gametype || "").toLowerCase().includes(target) ||
					(d?.mapname || "").toLowerCase().includes(target)
				);
			});
		}
		if (filter.locale) {
			const target = filter.locale.toLowerCase();
			results = results.filter((s) => s.Data?.vars?.locale?.toLowerCase() === target);
		}
		if (filter.hostname) {
			const target = filter.hostname.toLowerCase();
			results = results.filter((s) => {
				const name = s.Data?.hostname || "";
				return name.toLowerCase().includes(target) ||
					(s.Data?.vars?.sv_projectName || "").toLowerCase().includes(target);
			});
		}
		if (filter.gametype) {
			const target = filter.gametype.toLowerCase();
			results = results.filter((s) => (s.Data?.gametype || "").toLowerCase().includes(target));
		}
		if (filter.mapname) {
			const target = filter.mapname.toLowerCase();
			results = results.filter((s) => (s.Data?.mapname || "").toLowerCase().includes(target));
		}
		if (filter.tag) {
			const target = filter.tag.toLowerCase();
			results = results.filter((s) => (s.Data?.vars?.tags || "").toLowerCase().includes(target));
		}
	}

	if (limit && limit > 0) {
		results = results.slice(0, limit);
	}

	return results;
}

/**
 * Get a single server by its Cfx.re endpoint ID.
 *
 * @param endpoint - The server's unique endpoint ID (e.g. "3lamjz")
 * @param timeout - Request timeout in ms
 * @returns The matching server or null if not found
 */
export async function getServerByEndpoint(
	endpoint: string,
	timeout?: number,
): Promise<SearchResult | null> {
	const servers = await fetchAllServers(timeout);
	return servers.find((s) => s.EndPoint === endpoint) ?? null;
}

/**
 * Get all servers from the Cfx.re global server list.
 *
 * @param timeout - Request timeout in ms (default: 30000)
 * @returns All servers currently listed
 */
export async function getAllServers(timeout?: number): Promise<SearchResult[]> {
	return fetchAllServers(timeout);
}

/**
 * Get servers filtered by locale (e.g. "en-US", "de-DE").
 *
 * @param locale - The locale code to match
 * @param timeout - Request timeout in ms
 * @returns Servers matching the given locale
 */
export async function getServersByLocale(
	locale: string,
	timeout?: number,
): Promise<SearchResult[]> {
	return searchServers({ locale }, undefined, timeout);
}
