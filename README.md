# fivem-server-api
JavaScript API for getting information about FiveM Server

## Installation 
**Install Package**: npm i fivem-server-api

## Usage
**Examples**

Get Server Status [ Online / Offline ]
```js
const FiveM = require("fivem-server-api") // Import the NPM Package.
const server = new FiveM.Server('IP:PORT') // Set Server IP & Port.
 
server.getServerStatus().then(data => console.log(data)) // Get & Log the data!
```

Get Player Online Count
```js
server.getPlayers().then(data => console.log(data))
```

Get Online Player List
```js
server.getPlayersAll().then(data => console.log(data))
```

Get Server Resources List
```js
server.getResources().then(data => console.log(data))
```

## **ALL FUNCTION REQUESTS**
- getServerStatus()
- getPlayers() - Number of players online - (number)
- getPlayersAll() - List all players in an array - (string)
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