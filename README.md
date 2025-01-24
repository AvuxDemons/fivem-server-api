# **fivem-server-api**

Package for getting information about FiveM Server Using API

## Installation

Add `fivem-server-api` to your existing project.

```
npm i fivem-server-api
```

## Documentation

```js
// Import the Package ( Required )
// Using require (CommonJS)
const FiveM = require("fivem-server-api")

// Or using import (ESM)
import FiveM from "fivem-server-api"

// Options ( Optional )
const options = {
    timeout: 5000, // Default 5000ms / 5 seconds ( Milliseconds )
    errmsg: 'Error Occurred', // Default 'Error Occurred' ( String )
}

// Create New Object ( Required )
const server = new FiveM('CFX.re URL / IP:PORT', options)
/*  
    The first argument is CFX.re Server URL / Server IP Address ( REQUIRED )
    The second argument is Options                              ( Optional )
    Example : 
      const server = new FiveM('205.178.183.132:50120', options)  ||  Using IP:PORT
      const server = new FiveM('cfx.re/join/my59jq', options)     ||  Using CFX.re Url
      const server = new FiveM('https://cfx.re/join/my59jq')      ||  Using CFX.re Url

    Note* It will connecting to the server , so it need break atleast 5ms before you can call a method
*/

// How to use the function ( Executing after 2s Connected to server )
setTimeout(async () => {
    try {
        // Get server status
        const serverStatus = await server.getServerStatus();
        console.log("Server Status:", serverStatus);

        // Get the number of players
        const playerCount = await server.getPlayers();
        console.log("Player Count:", playerCount);

        // Get a list of all players
        const allPlayers = await server.getPlayersAll();
        console.log("All Players:", allPlayers);
    } catch (error) {
        console.error("Error:", error.message);
    }
}, 2000);
```

## **METHOD LIST**

| METHOD                   | DETAIL                                                        | RESPONSE       |
| :----------------------: | :-----------------------------------------------------------: | :------------: |
| getServer()              | Get the whole server object                                   | (string)       |
| getServerStatus()        | Server Status                                                 | (boolean)      |
| getServerName()          | Get server name                                               | (string)       |
| getServerDesc()          | Get server description                                        | (string)       |
| getPlayers()             | Number of players online                                      | (number)       |
| getPlayersAll()          | List all players                                              | (string/array) |
| getMaxPlayers()          | Max players that are able to join the server                  | (number)       |
| getResources()           | Get resource names of all server resources                    | (string/array) |
| getTags()                | Get all server tags                                           | (string)       |
| getOnesync()             | See if the server has OneSync enabled                         | (boolean)      |
| getLocale()              | The language of the server                                    | (string)       |
| getGamename()            | Get the name of the server                                    | (string)       |
| getSteamTicket()         | Is server require Steam ticket                                | (boolean)      |
| getGameBuild()           | FiveM build version                                           | (boolean)      |
| getEnhancedHostSupport() | ...                                                           | (boolean)      |
| getlicenseKeyToken()     | The license key for the server                                | (string)       |
| getScriptHookAllowed()   | See if the server supports external mod menus from the client | (boolean)      |
