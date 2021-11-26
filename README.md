# nkc-proxy

## 一、安装与运行
```
# git clone https://github.com/kccd/nkc-proxy.git
# cd nkc-proxy
# npm i 
# copy ./config.template.js ./config.js
# npm run server
```

## 二、配置文件

项目根目录中的 `config.js` 为配置文件，代理服务在启动前会读取该文件的内容。

```
// config.js
module.exports = {
  // httpAgent 文档地址：https://nodejs.org/docs/latest-v12.x/api/http.html#http_class_http_agent
  httpAgent: { 
    keepAlive: Boolean,
    maxFreeSockets: Number,
    keepAliveMsecs: Number,
    maxSockets: Number,
    maxTotalSockets: Number,
    timeout: Number
  },
  proxyTimeout: Number, // 等待被代理服务响应的超时时间 毫秒
  server: [ // 自定义规则
    {
      listen: Number, // 监听端口
      name: [String], // 域名

      sslKey: String, // ssl 证书文件路径
      sslCert: String,

      webPass: [String], // 被代理 http 服务的链接
      wsPass: [String], // 被代理 websocket 服务链接
      
      webType: String, // 分配 http 服务规则 random，ipHash 
      wsType: String, // 分配 websocket 服务规则 random，ipHash
      
      redirectCode: Number, 重定向状态码，默认 301
      redirectUrl: String, 重定向链接  
    }
  ] 
};
```
### 1、http to http

```
{
  listen: 80,
  name: [
    'www.test.com'
  ],
  webPass: [
    'http://127.0.0.1:10086',
    'http://127.0.0.1:10087',
    'http://127.0.0.1:10088'
  ],
  wsPass: [
    'http://127.0.0.1:10086',
    'http://127.0.0.1:10087',
    'http://127.0.0.1:10088'
  ],
  webType: 'random',
  wsType: 'ipHash'
}
```

### 2、https to http
```
{
  listen: 443,
  name: [
    'www.test.com'
  ],
  sslKey: '/web/cert/www.test.com.key',
  sslCert: '/web/cert/www.test.com.crt',
  webPass: [
    'http://127.0.0.1:10086',
    'http://127.0.0.1:10087',
    'http://127.0.0.1:10088'
  ],
  wsPass: [
    'http://127.0.0.1:10086',
    'http://127.0.0.1:10087',
    'http://127.0.0.1:10088'
  ],
  webType: 'random',
  wsType: 'ipHash'
}
```

### 3、http redirect to https
```
{
  listen: 80,
  name: [
    'www.test.com',
    'bbs.test.com',
    'test.com'
  ],
  redirectCode: 301,
  redirectUrl: 'https://www.test.com'
}

```
## 三、其他说明
由于 websocket 连接的建立和 socket.io 的 polling 模式基于 http 协议，所以为了保证在以上两种情况下服务能够被正确的代理，你需要请求特殊的 URL 或设置特殊的请求头。

方法 1 URL 匹配  
```
/^\/socket\.io\/\?/i;
```
方法 2 设置请求头
```
header['X-socket-io'] = 'polling'
```

如果 wsPass 配置存在，则符合以上条件的 http 请求将会被代理到 wsPass 列表中的某个服务（参看 wsType）。

