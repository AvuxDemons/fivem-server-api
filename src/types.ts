export interface ServerOptions {
	timeout?: number;
	retries?: number;
	retryDelay?: number;
	cacheTtl?: number;
	debug?: boolean | ((message: string) => void);
	minInterval?: number;
}

export interface Player {
	id: number;
	identifiers: string[];
	name: string;
	ping: number;
}

export interface ServerInfo {
	server: string;
	icon: string;
	resources: string[];
	players: Player[];
	vars: Record<string, string>;
	[key: string]: unknown;
}

export interface DynamicInfo {
	clients: number;
	gametype: string;
	hostname: string;
	mapname: string;
	sv_maxclients: string;
	iv: string;
}

export interface WatchHandle {
	stop(): void;
}

export interface MultiServerConfig {
	cfxre: string;
	options?: ServerOptions;
}

export type {
	SearchFilter,
	SearchPlayer,
	SearchServerData,
	SearchResult,
} from "./search.js";
