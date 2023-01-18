# **fivem-server-api**

Package for getting information about FiveM Server Using API

## Installation
Add `fivem-server-api` to your existing project.
```
npm i fivem-server-api
```

## Documentation

```js
const FiveM = require("fivem-server-api") // Import the Package.
const server = new FiveM.Server('IP', 'PORT', 'ERROR', options)
/*  The first argument is Server IP Address ( REQUIRED )
    The second argument is Server Port      ( REQUIRED )
    The third argument is Error Message     ( OPTIONAL )
    The fourth argument is Timeout Handler  ( OPTIONAL )  */

// OPTIONAL , You can ignore this option
const options = {
    timeout: 5000, // Default 5 seconds ( Convert To Milliseconds )
}

// How to use the function
server.getServerStatus().then(data => console.log(data)) // Get Server Status [ Online / Offline ]
server.getPlayers().then(data => console.log(data))      // Get Player Online Count

// Use More Than One Function
Promise.all([server.getServerStatus(), server.getPlayers()])
  .then(([serverStatus, players]) => {
    console.log(serverStatus);
    console.log(players);
  })
  .catch(error => {
    console.error(error);
  });
```

## **FUNCTION LIST**

| FUNCTION                 | DETAIL                                                        | RESULT         |
| :----------------------: | :-----------------------------------------------------------: | :------------: |
| getServerStatus()        | Server Status                                                 | (boolean)      |
| getPlayers()             | Number of players online                                      | (number)       |
| getPlayersAll()          | List all players                                              | (string/array) |
| getMaxPlayers()          | Max players that are able to join the server                  | (number)       |
| getResources()           | Get resource names of all server resources                    | (string/array) |
| getTags()                | Get all server tags                                           | (string)       |
| getServer()              | Get the whole server object                                   | (string)       |
| getOnesync()             | See if the server has OneSync enabled                         | (boolean)      |
| getLocale()              | The language of the server                                    | (string)       |
| getGamename()            | Get the name of the server                                    | (string)       |
| getEnhancedHostSupport() | ...                                                           | (boolean)      |
| getlicenseKeyToken()     | The license key for the server                                | (string)       |
| getScriptHookAllowed()   | See if the server supports external mod menus from the client | (boolean)      |
