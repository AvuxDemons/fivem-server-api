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

export interface WatchHandle {
	stop(): void;
}

export interface MultiServerConfig {
	cfxre: string;
	options?: ServerOptions;
}
