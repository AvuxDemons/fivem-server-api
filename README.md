# fivem-server-api
JavaScript API for getting information about FiveM Server

## Install
```
npm i fivem-server-api
```

## Usage

```js
const FiveM = require("fivem-server-api") // Import the NPM Package.
const server = new FiveM.Server('IP:PORT') // Set Server IP & Port.

/* Get Server Status [ Online / Offline ] */
server.getServerStatus().then(data => console.log(data))

/* Get Player Online Count */
server.getPlayers().then(data => console.log(data))

/* Get Online Player List */
server.getPlayersAll().then(data => console.log(data))

/* Get Max Players In The Server */
server.getMaxPlayers().then(data => console.log(data))

/* Get Server Resources List */
server.getResources().then(data => console.log(data))
```


## **ALL FUNCTION REQUESTS**
- getServerStatus() - Server Status - (boolean)
- getPlayers() - Number of players online - (number)
- getPlayersAll() - List all players - (string/array)
- getMaxPlayers() - Max players that are able to join the server - (number)
- getResources() - Get resource names of all server resources - (string/array)
- getTags() - Get all server tags - (string)
- getServer() - Get the whole server object - (string)
- getOnesync() - See if the server has OneSync enabled - (boolean)
- getLocale() - The language of the server - (string)
- getGamename() - Get the name of the server - (string)
- getEnhancedHostSupport() - ... - (boolean)
- getlicenseKeyToken() - The license key for the server - (string)
- getScriptHookAllowed() - See if the server supports external mod menus from the client - (boolean)