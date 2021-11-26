const httpProxy = require('http-proxy-ws');
const {
  getHttpAgent,
  getProxyTimeout,
  getHtmlContent
} = require('./methods');
const moment = require('moment');

const proxyServer = httpProxy.createProxyServer({
  agent: getHttpAgent(),
  ws: true,
  xfwd: true,
  timeout: getProxyTimeout(),
});

proxyServer.on('error', (err, req, res) => {
  const {host} = req.headers;
  console.log(`${` ERROR `.bgRed} ${moment().format('YYYY-MM-DD HH:mm:ss')} ${(' ' + host + ' ').bgGreen} ${err.message.bgRed}`);
  try{
    res.setHeader('content-type', 'text/html');
    res.writeHead(503);
    res.write(getHtmlContent(503));
    res.end();
  } catch(error) {
    console.log(`${` ERROR `.bgRed} ${moment().format('YYYY-MM-DD HH:mm:ss')} ${(' ' + host + ' ').bgGreen} ${err.message.bgRed}`);
  }
});
proxyServer.on('proxyReq', (proxyReq, req, res) => {
  const portKey = `x-forwarded-remote-port`;
  try{
    const remotePort = req.connection.remotePort;
    let remotePortStr = req.headers[portKey];
    if(remotePortStr) {
      remotePortStr = remotePortStr.split(',');
    } else {
      remotePortStr = [];
    }
    remotePortStr.push(remotePort);
    remotePortStr = remotePortStr.join(',');
    proxyReq.setHeader(portKey, remotePortStr);
  } catch(err) {
    const {host} = req.headers;
    console.log(`${` ERROR `.bgRed} ${moment().format('YYYY-MM-DD HH:mm:ss')} ${(' ' + host + ' ').bgGreen} ${err.message.bgRed}`);
  }
});

proxyServer.on('open', (proxySocket) => {
  //
})
proxyServer.on('proxyReqWs', (proxyReq, req, socket) => {
  // console.log(`ws middle`)
});

module.exports = proxyServer;