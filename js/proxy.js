#!/usr/bin/env nodejs
/* --------------------------------------------------------------------------------- *
 * Author: Johnathan Chivington                                                        *
 * Project: chivington.io main proxy                                                 *
 * Description: Proxies to backend app servers                                       *
 * Version: 0.0.1 - Proies app requests by subdomain.                                *
 * --------------------------------------------------------------------------------- */

// Includes
const os = require('os');
const fs = require('fs');
const url = require('url');
const http = require('http');

// Proxy request handler; accepts client request & response objects
function requestHandler(client_req,client_res) {
  const domain = 'chivington.io';
  const domain_root = `/var/www/domains/${domain}`;
  const ports = {api:3001,dev:3002,j:3003,www:3004};

  const client_headers = client_req.headers;
  const subdomain = client_headers.host.split('.')[0];
  const app = subdomain == 'chivington' ? 'www' : subdomain;
  const exists = fs.existsSync(`${domain_root}`);
  const datetime = new Date(Date.now()+86400000).toUTCString();

  const req_opts = {
    host: exists ? client_headers.host : `www.${domain}`,
    port: exists ? ports[app] : 3004,
    path: exists ? url.parse(client_req.url).pathname : '/',
    method: exists ? client_req.method : 'GET',
    headers: exists ? client_req.headers : {
        'content-type': 'text/html', 'last-modified': 'Tue, 15 Oct 2019 13:00:00 GMT', 'cache-control': 'max-age=86400', 'expires': datetime
      },
  };

  // Log request details
  console.log(`[${domain}/${app} - ${datetime}] ${req_opts.method} ${req_opts.host}${req_opts.path}`);

  // Backend request
  const back_req = http.request(req_opts,(back_res) => {
      client_res.writeHead(back_res.statusCode, back_res.headers);
      back_res.on('data', (chunk) => { client_res.write(chunk); });
      back_res.on('end', () => { client_res.end(); });
  });
  client_req.on('data', (chunk) => { back_req.write(chunk); });
  client_req.on('end', () => { back_req.end(); });
};

// Initialize proxy & log to console
const Proxy = http.createServer(requestHandler).listen(3000, '127.0.0.1');
console.log('[chivington.io - proxy] online at 127.0.0.1:3000');
