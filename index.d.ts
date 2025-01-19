declare module "Server" {
    export interface ServerOptions {
        timeout?: number;
        errmsg?: string;
    }

    export interface ServerStatus {
        online: boolean;
        url?: string;
        method?: string;
    }

    export default class Server {
        ip: string;
        options: ServerOptions;

        constructor(cfxre: string, options?: ServerOptions);

        cfxre(url: string): Promise<void>;

        getPlayers(): Promise<number | string>;

        getPlayersAll(): Promise<any[] | string>;

        getServerStatus(): Promise<ServerStatus>;

        getResources(): Promise<any | string>;

        getOnesync(): Promise<any | string>;

        getMaxPlayers(): Promise<any | string>;

        getLocale(): Promise<any | string>;

        getGamename(): Promise<any | string>;

        getSteamTicket(): Promise<any | string>;

        getGameBuild(): Promise<any | string>;

        getEnhancedHostSupport(): Promise<any | string>;

        getLicenseKeyToken(): Promise<any | string>;

        getScriptHookAllowed(): Promise<any | string>;

        getTags(): Promise<any | string>;

        getServer(): Promise<any | string>;

        getServerName(): Promise<string>;

        getServerDesc(): Promise<any | string>;

        getInfoField(field: string): Promise<any | string>;
    }
}
