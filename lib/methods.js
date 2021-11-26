const fs = require('fs');
const path = require('path');
const http = require('http');
const farmHash = require('farmhash');
const {
  httpAgent,
  proxyTimeout,
  server
} = require('../config');
const tls = require("tls");

const html = {
  '404': fs.readFileSync(path.resolve(__dirname, `../html/404.html`)),
  '503': fs.readFileSync(path.resolve(__dirname, `../html/503.html`))
};

const services = {};
const httpPorts = new Set();
const httpsPorts = new Set();

for(const s of server) {
  // 检查配置文件
  const {
    listen,
    sslKey = '',
    sslCert = '',
    name = [],
    webType = 'random',
    wsType = 'ipHash',
    webPass = [],
    wsPass = [],
    redirectCode = 301,
    redirectUrl = '',
  } = s;

  const errorName = `config error:`

  if(!listen) throw new Error(`${errorName} listen 不能为空`);
  if(name.length === 0) throw new Error(`${errorName} name 不能为空`);
  let isHTTPS = true;
  if(sslKey) {
    fsStat(sslKey);
  } else {
    isHTTPS = false;
  }
  if(sslCert) {
    fsStat(sslCert);
  } else {
    isHTTPS = false;
  }
  if(!redirectUrl && webPass.length === 0 && wsPass.length === 0) {
    throw new Error(`${errorName} pass 不能为空`);
  }

  if(isHTTPS) {
    httpsPorts.add(s.listen);
  } else {
    httpPorts.add(s.listen);
  }

  for(const n of name) {
    if(!services[listen]) services[listen] = {};
    services[listen][n] = {
      webType,
      wsType,
      webPass,
      wsPass,
      redirectUrl,
      redirectCode,
    };
  }
}

function getServices() {
  return services;
}

function getHttpPorts() {
  return [...httpPorts];
}

function getHttpsPorts() {
  return [...httpsPorts];
}

function getSecureContext() {
  const secureContext = {};
  let defaultSSL;
  for(const s of server) {
    if(!s.sslKey || !s.sslCert) continue;
    const keyPath = s.sslKey;
    const certPath = s.sslCert;
    for(const n of s.name) {
      const key = fs.readFileSync(keyPath);
      const cert = fs.readFileSync(certPath);
      secureContext[n] = tls.createSecureContext({
        key,
        cert
      });
      if(!defaultSSL) {
        defaultSSL = {
          key, cert
        }
      }
    }
  }
  return {
    secureContext,
    defaultSSL
  };
}


function getHttpsOptions() {
  const {
    secureContext,
    defaultSSL
  } = getSecureContext();
  return {
    minVersion: 'TLSv1.1',
    key: defaultSSL.key,
    cert: defaultSSL.cert,
    SNICallback: function(domain, cb) {
      const sc = secureContext[domain];
      if(cb) {
        cb(null, sc);
      } else {
        return sc;
      }
    }
  };
}

function getIp(req) {
  return req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
}

function getHttpAgent() {
  return new http.Agent(httpAgent);
}

function getProxyTimeout() {
  return proxyTimeout;
}

function getService(host, port) {
  const services = getServices();
  return services[port][host];
}

function getTargetUrlByPass(type, pass, ip) {
  const passType = type || 'random';
  const targets = pass;
  const index = passType === 'random'?
    Math.round(Math.random() * 100) % targets.length:
    farmHash.hash32(ip) % targets.length;
  return targets[index];
}

function getHostname(req) {
  let host = '';
  if(req && req.headers && req.headers.host) {
    host = req.headers.host;
  }
  return host.replace(/:.*/, '');
}

function getHtmlContent(status) {
  return html[status];
}

function fsStat(filePath) {
  return fs.statSync(filePath);
}

module.exports = {
  getHostname,
  getHttpsPorts,
  getHttpPorts,
  getHttpsOptions,
  getHttpAgent,
  getProxyTimeout,
  getService,
  getHtmlContent,
  getTargetUrlByPass,
  getIp
}