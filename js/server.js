#!/usr/bin/env nodejs
// Name: Johnathan Chivington
// Project: chivington.io App Server
// Description: Basic node file/app server
// Version: 0.0.1 - Serves apps by subdomain.

// Includes
const os = require('os');
const fs = require('fs');
const url = require('url');
const http = require('http');
const qs = require('querystring');


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

// Logger
function log_details(type,details) {
  console.log(`.`);console.log(`.`);
  console.log(`${type} REQUEST:\n`,details);
  console.log(`.`);console.log(`.`);
};

// Request Parser
function parse_request(request) {
  // Constants
  const app_root = `/var/www/domains/chivington.io`;
  const last_modified = `Wed, 25 Mar 2020 13:00:00 GMT`;
  const age = `max-age=86400`;
  const datetime = new Date(Date.now() + 86400000).toUTCString();

  // Request Details
  const subdomain = request.headers.host.split('.')[0];
  const uri = url.parse(request.url).pathname;
  const exists = fs.existsSync(`${app_root}${uri}`);
  const resource = app_root + (uri == '/' ? '/index.html' : (exists ? `${uri}` : `/index.html`));
  const extension = resource.split('.')[2];
  const mime = mimeTypes[extension] ? mimeTypes[extension] : mimeTypes['html'];

  // Return request details
  return [app_root,last_modified,age,datetime,subdomain,uri,exists,resource,extension,mime];
};


// RTC API
threads = {};
function rtc_api(request,response) {
  const [app_root,last_modified,age,datetime,subdomain,uri,exists,resource,extension,mime] = parse_request(request);

  let body = `Your message was: `;
  request.on('data', function(chunk) {
    body += chunk;
    if (body > 1e6) body.msg = `Message too long`;
  });

  request.on('end', function() {
    log_details(`RTC`,{datetime,uri,body});
    const header_details = {'content-type': mime, 'last-modified': last_modified, 'cache-control': age, 'expires': datetime};
    // body = qs.parse(body);
    response.writeHead(200, header_details);
    response.write(body);
    response.end();
  });
};


// Serve App
function app_api(request,response) {
  const [app_root,last_modified,age,datetime,subdomain,uri,exists,resource,extension,mime] = parse_request(request);

  // Log app request
  log_details(`APP`,{datetime,uri});

  // Header Details
  const header_details = {'content-type': mime, 'last-modified': last_modified, 'cache-control': age, 'expires': datetime};

  // Send Response
  fs.readFile(resource, null, function(err, data) {
    response.writeHead(200, header_details);
    response.write(data);
    response.end();
  });
};


// Request Handler
function requestHandler(request,response) {
  // Serve app or relay rtc
  if (request.method == `POST`) rtc_api(request,response);
  else app_api(request,response);
};


http.createServer(requestHandler).listen(3000, '127.0.0.1');
console.log('[chivington.io - app server] online at 127.0.0.1:3000/');
