const proxyServer = require('./proxyServer');
const destroy = require('destroy');
const moment = require('moment');
const {getHostname, getService, getTargetUrlByPass, getIp} = require("./methods");
module.exports = function(req, socket, head) {
  const server = this;
  const port = server.address().port;
  const hostname = getHostname(req);
  const service = getService(hostname, port);
  if(
    !service ||
    service.redirectUrl ||
    service.wsPass.length === 0 ||
    service.webPass.length === 0
  ) {
    destroy(req);
    destroy(socket);
    return;
  }

  let targetPass = service.wsPass;
  let targetType = service.wsType;
  if(targetPass.length === 0) {
    targetPass = service.webPass;
    targetType = service.webType;
  }
  const ip = getIp(req);
  const targetUrl = getTargetUrlByPass(targetType, targetPass, ip);
  proxyServer.ws(req, socket, head, {
    target: targetUrl
  });
  socket.setKeepAlive(false, 0);
  socket.on('error', (err) => {
    console.log(`${`UPGRADE ERROR `.bgRed} ${moment().format('YYYY-MM-DD HH:mm:ss')} ${(' ' + hostname + ' ').bgGreen} ${err.message.bgRed}`);
  });
};