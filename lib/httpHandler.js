const proxyServer = require('./proxyServer');
const {getService, getIp, getTargetUrlByPass, getHostname, getHtmlContent} = require('./methods');
const reg = /^\/socket\.io\/\?/i;
module.exports = function(req, res) {
  const server = this;
  const url = req.url;
  const port = server.address().port;
  const hostname = getHostname(req);
  const service = getService(hostname, port);

  // 不存在配置
  if(!service) {
    res.setHeader('content-type', 'text/html');
    res.statusCode = 404;
    res.write(getHtmlContent(404));
    return res.end();
  }

  const {
    redirectUrl,
    redirectCode,
    webType,
    wsType,
    webPass = [],
    wsPass = []
  } = service;

  let targetType = webType;
  let targetPass = webPass;

  // 重定向
  if(redirectUrl) {
    res.writeHead(redirectCode, {
      'location': redirectUrl + url
    });
    return res.end();
  }

  if(
    (reg.test(url) || (req.headers && req.headers['X-socket-io'] === 'polling')) &&
    wsPass.length > 0
  ) {
    targetType = wsType;
    targetPass = wsPass;
  }

  const ip = getIp(req);

  const targetUrl = getTargetUrlByPass(targetType, targetPass, ip);

  proxyServer.web(req, res, {
    target: targetUrl
  });
}