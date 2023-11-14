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
const FiveM = require("fivem-server-api")

// Options ( Optional )
const options = {
    timeout: 5000, // Default 5000ms / 5 seconds ( Milliseconds )
    errmsg: 'Error Occured', // Default 'Error Occured' ( String )
}

// Create New Object ( Require )
const server = new FiveM.Server('CFX.re URL / IP:PORT', options)
/*  
    The first argument is CFX.re Server URL / Server IP Address ( REQUIRED )
    The second argument is Options                              ( Optional )
    Example : 
      const server = new FiveM.Server('205.178.183.132:50120', options)  ||  Using IP:PORT
      const server = new FiveM.Server('cfx.re/join/my59jq', options)     ||  Using CFX.re Url
      const server = new FiveM.Server('https://cfx.re/join/my59jq')      ||  Using CFX.re Url
*/


// How to use the function

// Promise ( Single Func )
server.getServerStatus().then(data => console.log(data))
server.getPlayers().then(data => console.log(data))

// PromiseAll ( Multiple Func )
Promise.all([server.getServerStatus(), server.getPlayers()]).then(([serverStatus, players]) => {
    console.log(serverStatus);
    console.log(players);
}).catch(error => {
    console.error(error);
});

// Async/Await ( Single Func )
async function fetchServerStatus() {
    const serverStatus = await server.getServerStatus();
    console.log(serverStatus);
}

async function fetchPlayers() {
    const players = await server.getPlayers();
    console.log(players);
}

// Async/Await ( Multiple Func )
async function fetchData() {
    try {
        const [serverStatus, players] = await Promise.all([server.getServerStatus(), server.getPlayers()]);
        console.log(serverStatus);
        console.log(players);
    } catch (error) {
        console.error(error);
    }
}
```

## **FUNCTION LIST**

| FUNCTION                 | DETAIL                                                        | RESULT         |
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
