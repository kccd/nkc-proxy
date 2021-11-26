module.exports = {
  httpAgent: {
    keepAlive: true,
    maxFreeSockets: 64,
    keepAliveMsecs: 8000,
    maxSockets: 500,
    maxTotalSockets: 5000,
    timeout: 30000
  },
  proxyTimeout: 30000,
  server: [
    {
      listen: 443,
      name: [
        `www.test.com`
      ],
      sslKey: `/ssl_cert_key.key`,
      sslCert: `/ssl_cert.crt`,
      webPass: [
        'http://127.0.0.1:10086',
        'http://127.0.0.1:10087'
      ],
      webType: 'random',
      wsPass: [
        'http://127.0.0.1:10086',
        'http://127.0.0.1:10087'
      ],
      wsType: 'ipHash',
    },
    {
      listen: 80,
      name: [
        `test.com`,
        `www.test.com`
      ],
      redirectCode: 301,
      redirectUrl: `https://www.test.com`
    }
  ]
};