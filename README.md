# fivem-server-api

Package for getting information about a FiveM server via its API endpoints.

## Installation

```
npm i fivem-server-api
```

## CLI

```bash
npx fivem-server-api cfx.re/join/my59jq
npx fivem-server-api 1.2.3.4:30120 --json
npx fivem-server-api cfx.re/join/code --timeout=15000
```

## Usage

```js
// ESM
import FiveM, { FiveMError } from "fivem-server-api";

// CJS
const FiveM = require("fivem-server-api");
```

### Accepted Input Formats

| Format | Example |
|--------|---------|
| IP:PORT | `205.178.183.132:30120` |
| IP only | `205.178.183.132` |
| Domain:PORT | `myserver.com:30120` |
| CFX.re short URL | `cfx.re/join/my59jq` |
| CFX.re full URL | `https://cfx.re/join/my59jq` |
| CFX.re code only | `my59jq` |

### Basic Example

```js
import FiveM from "fivem-server-api";

const server = new FiveM("cfx.re/join/my59jq", { timeout: 10000 });

const online = await server.getServerStatus();

if (online) {
  const info = await server.getServer();
  console.log("Name:", await server.getServerName());
  console.log("Players:", await server.getPlayers());
  console.log("Resources:", (await server.getResources()).length);
}
```

### Error Handling

All methods throw `FiveMError` on failure, except `getServerStatus()` which returns `false` when unreachable.

```js
import FiveM, { FiveMError } from "fivem-server-api";

const server = new FiveM("1.2.3.4:30120");

try {
  const players = await server.getPlayersAll();
  console.log(`Online: ${players.length}`);
} catch (err) {
  if (err instanceof FiveMError) {
    console.error(`[${err.method}] ${err.message}`);
  }
}
```

`FiveMError` properties: `name`, `message`, `method`, `url`, `status`, `cause`.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `timeout` | `number` | `5000` | Request timeout in milliseconds |
| `retries` | `number` | `0` | Number of retry attempts on failure |
| `retryDelay` | `number` | `1000` | Delay between retries in milliseconds |
| `cacheTtl` | `number` | `5000` | Cache duration for `info.json` in ms. Set `0` to disable |
| `debug` | `boolean \| (msg: string) => void` | `false` | Enable logging. Pass `true` for console.log, or a custom logger function |
| `minInterval` | `number` | `0` | Minimum delay between requests in ms (rate limiting) |

```js
const server = new FiveM("cfx.re/join/code", {
  timeout: 10000,
  retries: 2,
  retryDelay: 1000,
  cacheTtl: 0,
  debug: (msg) => console.log("[DEBUG]", msg),
  minInterval: 500,
});
```

## Method List

### Properties & Control

| Method | Returns | Description |
|:-------|:--------|:------------|
| `ready()` | `Promise<void>` | Resolves when server IP is resolved (CFX.re). No-op for IP:PORT |
| `clearCache()` | `void` | Clear cached `info.json` to force re-fetch |
| `playerCount` | `number` | Sync getter — cached count from last `getPlayers()`/`getPlayersAll()`/`getServer()` |
| `getIp()` | `string` | Resolved server IP:PORT (sync) |

### Data Methods

| Method | Returns | Throws | Description |
|:-------|:--------|:-------|:------------|
| `getServerStatus()` | `Promise<boolean>` | No | Server online status |
| `getServer()` | `Promise<ServerInfo>` | Yes | Full server info from `info.json` |
| `getServerName()` | `Promise<string>` | Yes | Server name (color codes stripped) |
| `getServerDesc()` | `Promise<string>` | Yes | Server description |
| `getPlayers()` | `Promise<number>` | Yes | Number of players online |
| `getPlayersAll()` | `Promise<Player[]>` | Yes | All players with name, ping, identifiers |
| `getPlayer(query)` | `Promise<Player \| null>` | Yes | Search by id (number), name substring, or identifier |
| `getMaxPlayers()` | `Promise<number>` | Yes | Max player slots |
| `getResources()` | `Promise<string[]>` | Yes | Resource names |
| `getTags()` | `Promise<string>` | Yes | Server tags (comma-separated) |
| `getOnesync()` | `Promise<boolean>` | Yes | OneSync enabled |
| `getLocale()` | `Promise<string>` | Yes | Server locale (e.g. `id-ID`) |
| `getGamename()` | `Promise<string>` | Yes | Game name (e.g. `gta5`) |
| `getSteamTicket()` | `Promise<boolean>` | Yes | Steam ticket required |
| `getGameBuild()` | `Promise<number>` | Yes | Enforced game build |
| `getEnhancedHostSupport()` | `Promise<boolean>` | Yes | Enhanced host support |
| `getLicenseKeyToken()` | `Promise<string>` | Yes | License key token |
| `getScriptHookAllowed()` | `Promise<boolean>` | Yes | ScriptHook allowed |
| `getEndpoint()` | `Promise<string \| null>` | Yes | Dynamic server endpoint |
| `getIcon()` | `Promise<string>` | Yes | Server icon (base64 data URI) |
| `getUpvotePower()` | `Promise<number>` | Yes | Server upvote power |
| `getBurstPower()` | `Promise<number>` | Yes | Server burst power (boost) |
| `getClients()` | `Promise<number>` | Yes | Player count via lightweight `dynamic.json`. Falls back to `players.json` |
| `getHostname()` | `Promise<string>` | Yes | Raw hostname from `dynamic.json`. Falls back to `sv_projectName` |
| `getGametype()` | `Promise<string>` | Yes | Game type from `dynamic.json` (Roleplay, Freeroam, etc.) |
| `getMapname()` | `Promise<string>` | Yes | Map name from `dynamic.json` (San Andreas, etc.) |
| `getSvMaxclients()` | `Promise<number>` | Yes | Max clients from `dynamic.json`. Falls back to info.json |
| `getOwnerName()` | `Promise<string>` | Yes | Owner display name |
| `getOwnerProfile()` | `Promise<string>` | Yes | Owner forum profile URL |
| `getOwnerAvatar()` | `Promise<string>` | Yes | Owner avatar URL |

### Player Search

```js
// By ID (number — exact match)
const player = await server.getPlayer(42);

// By name (string — case-insensitive substring)
const player = await server.getPlayer("playername");

// By identifier (string starting with license:/steam:/discord: — exact match)
const player = await server.getPlayer("license:abc123def");
```

### Watch (Polling)

```js
const handle = server.watch(5000, async (s) => {
  const count = await s.getPlayers();
  console.log(`Players: ${count} (cached: ${s.playerCount})`);
});

// Later: handle.stop();
```

### Multi-Server

```js
const result = await FiveM.multi([
  { cfxre: "1.2.3.4:30120" },
  { cfxre: "cfx.re/join/code1" },
  { cfxre: "cfx.re/join/code2", options: { timeout: 10000 } },
]);

console.log("All servers:", result.servers.length);

const statuses = await result.getAllStatus();
// Map<string, boolean> — IP → online/offline

const counts = await result.getAllPlayers();
// Map<string, number> — IP → player count (-1 if failed)

const online = await result.getOnlineServers();
// Server[] — only online servers
```

### Server Search

Search the global FiveM server list from Cfx.re. By default returns 20 results — pass `0` for unlimited. Stops decoding early when enough matches are found.

```js
import {
  searchServers, getAllServers, getServerByEndpoint, getServersByLocale,
  getIconUrl, isPrivateServer,
} from "fivem-server-api";

// Get all servers (default 30s timeout)
const all = await getAllServers();
console.log(`Total: ${all.length} servers`);

// Filter by locale (default 20 results)
const idServers = await getServersByLocale("id-ID");
console.log(`Indonesian servers: ${idServers.length}`);

// Search with multiple filters + pagination
const page1 = await searchServers(
  { query: "roleplay", gametype: "roleplay", locale: "id-ID" },
  10,    // limit (default: 20, pass 0 for unlimited)
  30000, // timeout ms (default: 30000)
  0,     // offset (default: 0)
);
const page2 = await searchServers(
  { query: "roleplay" },
  10,     // 10 per page
  30000,
  10,     // skip first 10
);

// Find a specific server by endpoint ID
const server = await getServerByEndpoint("3lamjz");
if (server) {
  console.log(server.Data.hostname);
  console.log(`${server.Data.clients}/${server.Data.svMaxclients} players`);

  // Icon URL — null if iconVersion is 0 (no custom icon)
  const iconUrl = getIconUrl(server);
  // => "https://frontend.cfx-services.net/api/servers/icon/3lamjz/5.png"

  // Check if server is private
  if (isPrivateServer(server)) {
    console.log("Private server — IP hidden");
  }
}
```

#### SearchFilter

| Field | Type | Description |
|-------|------|-------------|
| `query` | `string` | Searches across hostname, sv_projectName, tags, gametype, mapname (case-insensitive partial) |
| `locale` | `string` | Exact locale match (e.g. `"en-US"`, `"id-ID"`) |
| `hostname` | `string` | Partial match on server hostname and sv_projectName |
| `gametype` | `string` | Partial match on game type (e.g. `"roleplay"`, `"freeroam"`) |
| `mapname` | `string` | Partial match on map name (e.g. `"San Andreas"`) |
| `tag` | `string` | Partial match on server tags |

#### SearchResult

```ts
interface SearchResult {
  EndPoint: string;        // Unique server ID (e.g. "3lamjz")
  Data: {
    hostname: string;      // Server display name
    clients: number;       // Current players
    svMaxclients: number;  // Max player slots
    gametype: string;      // e.g. "Roleplay", "Freeroam"
    mapname: string;       // e.g. "San Andreas"
    iconVersion: number;   // Icon version (0 = no custom icon)
    vars: Record<string, string>;  // locale, tags, sv_projectName, etc.
    resources: string[];
    players: SearchPlayer[];
    connectEndPoints: string[];     // IP:PORT or "private-placeholder.cfx.re" for private servers
    upvotePower: number;
    burstPower: number;
    // ... and more
  };
}
```

#### Icon & Private Helpers

```ts
import { getIconUrl, isPrivateServer } from "fivem-server-api";

// getIconUrl(server) => string | null
// Returns Cfx.re CDN icon URL, or null if iconVersion is 0
const icon = getIconUrl(result);
if (icon) {
  // https://frontend.cfx-services.net/api/servers/icon/oax6pvv/2006463867.png
}

// isPrivateServer(server) => boolean
// True if connectEndPoints contains "private-placeholder.cfx.re"
if (isPrivateServer(result)) {
  console.log("This server hides its IP");
}
```

## TypeScript Types

```ts
interface ServerOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cacheTtl?: number;
  debug?: boolean | ((message: string) => void);
  minInterval?: number;
}

interface Player {
  id: number;
  identifiers: string[];
  name: string;
  ping: number;
}

interface ServerInfo {
  server: string;
  icon: string;
  resources: string[];
  players: Player[];
  vars: Record<string, string>;
  [key: string]: unknown;
}

interface DynamicInfo {
  clients: number;
  gametype: string;
  hostname: string;
  mapname: string;
  sv_maxclients: string;
  iv: string;
}

interface WatchHandle {
  stop(): void;
}

interface MultiServerConfig {
  cfxre: string;
  options?: ServerOptions;
}
```

All types are exported:

```ts
import type {
  Player, ServerInfo, DynamicInfo, ServerOptions,
  WatchHandle, MultiServerConfig,
  SearchFilter, SearchResult, SearchPlayer, SearchServerData,
} from "fivem-server-api";
```

All utility functions are exported:

```ts
import {
  searchServers, getAllServers, getServerByEndpoint, getServersByLocale,
  getIconUrl, isPrivateServer,
} from "fivem-server-api";
```

## Migrating from v1.x

| v1.x | v2.x |
|------|------|
| Returns `errmsg` on error | Throws `FiveMError` — use `try/catch` |
| Needs `setTimeout` before use | No delay — internal ready state |
| `console.log` on connect | Silent by default (use `debug` option) |
| `getServerStatus()` → object | `getServerStatus()` → `boolean` |
| No caching | `info.json` cached with configurable TTL |
| Duplicate `index.cjs` / `index.mjs` | Single TypeScript source |
| — | `ready()`, `clearCache()`, `playerCount`, `getPlayer()` |
| — | `watch()`, `Server.multi()`, CLI tool |

```js
// v1.x
const FiveM = require("fivem-server-api");
const server = new FiveM("1.2.3.4:30120", { timeout: 5000, errmsg: "Error" });
setTimeout(async () => {
  const status = await server.getServerStatus();
  if (status.online) { /* ... */ }
}, 2000);

// v2.x
import FiveM from "fivem-server-api";
const server = new FiveM("1.2.3.4:30120", { timeout: 5000 });
await server.ready(); // optional — methods auto-wait
const online = await server.getServerStatus();
if (online) { /* ... */ }
```

## License

ISC
