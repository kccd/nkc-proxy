require('colors');
const http = require('http');
const https = require('https');
const {
  getHttpsPorts,
  getHttpPorts,
  getHttpsOptions,
} = require('./lib/methods');

const websocketHandler = require('./lib/websocketHandler')
const httpHandler = require('./lib/httpHandler');
const httpsHandler = require('./lib/httpsHandler');

function start() {

  const httpPorts = getHttpPorts();
  const httpsPorts = getHttpsPorts();

  if(httpPorts.length) {
    for(const port of httpPorts) {
      const server = http.createServer(httpHandler)
      server.listen(port);
      server.on('upgrade', websocketHandler);
    }
    console.log(`http server is running at ${httpPorts.join(', ')}.`);
  }

  if(httpsPorts.length) {
    const httpsOptions = getHttpsOptions();
    for(const port of httpsPorts) {
      const server = https.createServer(httpsOptions, httpsHandler)
      server.listen(port);
      server.on('upgrade', websocketHandler);
    }
    console.log(`https server is running at ${httpsPorts.join(', ')}.`);
  }
  console.log(`nkc-proxy is running.`);
  console.log(`PID: ${process.pid}`);
}

start();