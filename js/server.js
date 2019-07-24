#!/usr/bin/env nodejs
/* --------------------------------------------------------------------------------- *
 * Name: Johnathan Chivington                                                        *
 * Project: Personal Web App                                                         *
 * Description: Basic node file server                                               *
 * Version: 0.1.0 - (production) Simple request handler that serves index.html only. *
 * --------------------------------------------------------------------------------- */

/* ------------------------------------ Imports ------------------------------------ *
 *                              Native NodeJs modules.                               *
 * --------------------------------------------------------------------------------- */
const os = require('os');
const fs = require('fs');
const url = require('url');
const http = require('http');


/* ----------------------------------- Blueprint ----------------------------------- *
 *                            Specifies service structure.                           *
 * --------------------------------------------------------------------------------- */
const Blueprint = {
  appRoot: `/var/www/html/chivingtoninc.com`,
  subdomains: ['api', 'ai', 'blog', 'friday', 'mail', 'vpn',  'www', 'work'],
  mimeTypes: {
    'html': 'text/html',
    'js': 'application/javascript',
    'json': 'text/json',
    'ico': 'image/ico',
    'svg': 'image/svg+xml',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'png': 'image/png',
    'otf': 'application/x-font-otf'
  }
};

/* ------------------------------------ Servers ------------------------------------ *
 *                          Serves various types of content.                         *
 * --------------------------------------------------------------------------------- */
const Servers = {
  rootHandler: function(request, response) {
    const host = request.headers.host;

    // Select Subdomain
    const subdomain = subdomains.includes(host.split('.')[0]) ? host.split('.')[0] : 'www';

    if (subdomain = 'api') Handlers.databaseHandler(request, response);
    else Handlers.resourceHandler(request, response);

    const { appRoot, subdomains, mimeTypes } = Blueprint;
    const uri = url.parse(request.url).pathname;
    const resource = appRoot + (uri == '/' ? '/index.html' : uri);
    const extension = resource.split('.')[2];
    const exists = fs.existsSync(`${appRoot}/${uri}`);

    // Select Mime-Type
    const mime = mimeTypes[extension] ? mimeTypes[extension] : mimeTypes['html'];

    // Print Request Details
    console.log('SUBDOMAIN: ', subdomain);
    console.log(`URI: ${uri}`);
    console.log(`RESOURCE: ${resource}`);
    console.log(`TYPE: ${mime}`);

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
  },
  resourceServer: function() {},
  databaseServer: function() {}
};


/* --------------------------------- Root Handler ---------------------------------- *
 *                         Handles various types of requests.                        *
 * --------------------------------------------------------------------------------- */
function requestHandler(request, response) {
  const host = request.headers.host;
  const subdomain = subdomains.includes(host.split('.')[0]) ? host.split('.')[0] : 'www';

  if (subdomain = 'api') Utils.databaseHandler(request, response);
  else Utils.resourceHandler(request, response);
};


http.createServer(requestHandler).listen(3000, '127.0.0.1');
console.log('Server running at http://localhost:3000/');
