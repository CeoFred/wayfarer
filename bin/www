(function() {
    var childProcess = require("child_process");
    var oldSpawn = childProcess.spawn;
    function mySpawn() {
        console.log('spawn called');
        console.log(arguments);
        var result = oldSpawn.apply(this, arguments);
        return result;
    }
    childProcess.spawn = mySpawn;
})();
// This will be our application entry. We'll setup our server here.
const http = require('http');
const app = require('../build/index.js'); // The express app 
require('dotenv').config()
const config = require('../build/config/config')

const port = parseInt(config.server.port, 10);
app.set('port', port);

const server = http.createServer(app);
server.listen(port,() => {
    console.log('Listening on post ' + port)
});

module.exports = {server,port}
