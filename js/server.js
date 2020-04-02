#!/usr/bin/env nodejs

/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: chivington.io App Server                                                 *
 * Description: Basic node file/app server                                           *
 * Version: 0.0.1 - Serves apps by subdomain.                                        *
 * --------------------------------------------------------------------------------- */

// Includes
const os = require('os');
const fs = require('fs');
const url = require('url');
const http = require('http');

// Mime-Types
const mimeTypes = {
  'html': 'text/html',
  'css': 'text/css',
  'js': 'application/javascript',
  'json': 'text/json',
  'ico': 'image/ico',
  'svg': 'image/svg+xml',
  'jpeg': 'image/jpeg',
  'jpg': 'image/jpeg',
  'png': 'image/png',
  'otf': 'application/x-font-otf'
};

// Logging Util
function logRequest(s,u,r,m) {
  console.log(`\nSUBDOMAIN: ${s}`);
  console.log(`URI: ${u}`);
  console.log(`RESOURCE: ${r}`);
  console.log(`TYPE: ${m}\n`);
  console.log('.');
};

// Request Handler
function requestHandler (request, response) {
  // Constants
  const appRoot = `/var/www/domains/chivington.io/www`;
  const lastModified = `Wed, 25 Mar 2020 13:00:00 GMT`;
  const age = `max-age=86400`;
  const datetime = new Date(Date.now() + 86400000).toUTCString();

  // Request Details
  const subdomain = request.headers.host.split('.')[0];
  const uri = url.parse(request.url).pathname;
  const exists = fs.existsSync(`${appRoot}${uri}`);
  const resource = appRoot + (uri == '/' ? '/index.html' : (exists ? `${uri}` : `/index.html`));
  const extension = resource.split('.')[2];
  const mime = mimeTypes[extension] ? mimeTypes[extension] : mimeTypes['html'];

  // Header Details
  const headerDetails = {
    'content-type': mime, 'last-modified': lastModified, 'cache-control': age, 'expires': datetime
  };

  // Log each request
  logRequest(subdomain, uri, resource, mime);

  // Serve requested app or default to main
  fs.readFile(resource, null, function(err, data) {
    response.writeHead(200, headerDetails);
    response.write(data);
    response.end();
  });
};

http.createServer(requestHandler).listen(3004, '127.0.1.1');
console.log('[chivington.io - app server] online at 127.0.1.1:3004/');
