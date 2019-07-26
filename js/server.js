#!/usr/bin/env nodejs

/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: Personal Web App API                                                     *
 * Description: Basic node file server                                               *
 * Version: 0.1.0 - (production) Simple request handler that serves index.html only. *
 * --------------------------------------------------------------------------------- */

const os = require('os');
const fs = require('fs');
const url = require('url');
const http = require('http');

// Root Directory
const appRoot = `/var/www/html/chivingtoninc.com`;

// Request Handler
const requestHandler = (request, response) => {
  const subdomain = request.headers.host;
  const uri = url.parse(request.url).pathname;
  const exists = fs.existsSync(`${appRoot}/${uri}`);
  const resource = appRoot + (uri == '/' ? '/index.html' : (exists ? `${uri}` : `/index.html`));
  const extension = resource.split('.')[2];

  // Select Mime-Type
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
  const mime = mimeTypes[extension] ? mimeTypes[extension] : mimeTypes['html'];

  // Print Request Details
  console.log('\nSUBDOMAIN: ', subdomain);
  console.log(`URI: ${uri}`);
  console.log(`RESOURCE: ${resource}`);
  console.log(`TYPE: ${mime}\n`);

  response.writeHead(200, {
    'content-type': mime,
    'last-modified': 'Fri, 14 Dec 2018 13:00:00 GMT',
    'cache-control': 'max-age=86400',
    'expires': new Date(Date.now() + 86400000).toUTCString(),
  });

  // Respond with resource or app error view
  fs.readFile(resource, null, function(err, data) {
    // Serve resource with 200, if exists
    if (exists) {
      response.writeHead(200, {
        'content-type': mime,
        'last-modified': 'Fri, 14 Dec 2018 13:00:00 GMT',
        'cache-control': 'max-age=86400',
        'expires': new Date(Date.now() + 86400000).toUTCString(),
      });
      response.write(data);
    }
    // Serve app with 404, if resource doesn't exist
    else {
      response.writeHead(404, {
        'content-type': mime,
        'last-modified': 'Fri, 14 Dec 2018 13:00:00 GMT',
        'cache-control': 'max-age=86400',
        'expires': new Date(Date.now() + 86400000).toUTCString(),
      });
      response.write(data);
    }

    // End Connection
    response.end();
  });
};

http.createServer(requestHandler).listen(3000, '127.0.0.1');
console.log('Server running at http://localhost:3000/');
