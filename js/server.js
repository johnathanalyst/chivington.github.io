#!/usr/bin/env nodejs
const os = require('os');
const fs = require('fs');
const url = require('url');
const http = require('http');

// Root Directory
const appRoot = `/var/www/html/chivingtoninc.com`

// Request Handler
const requestHandler = (req, res) => {
  const uri = url.parse(req.url).pathname;
  const exists = fs.existsSync(`${appRoot}/${uri}`);
  const resource = appRoot + (uri == "/" ? "/index.html" : (exists ? `${uri}` : `/index.html`));

  // Select Mime-Type
  const mimeTypes = {
    "html": "text/html",
    "js": "application/javascript",
    "svg": "image/svg+xml",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "otf": "application/x-font-otf"
  };
  const mime = mimeTypes[resource.split('.')[2]] ? mimeTypes[resource.split('.')[2]] : mimeTypes["html"];

  // Print Request Details
  console.log("URI: ", uri);
  console.log("RESOURCE: ", resource);
  console.log("TYPE: ", mime);

  // Respond with resource or app error view
  fs.readFile(resource, null, function(err, data) {
    // Serve resource with 200, if exists
    if (exists) {
      res.writeHead(200, {
        'content-type': mime,
        'last-modified': 'Fri, 14 Dec 2018 13:00:00 GMT',
        'cache-control': 'max-age=86400',
        'expires': new Date(Date.now() + 86400000).toUTCString(),
      });
      res.write(data);
    }
    // Serve app with 404, if resource doesn't exist
    else {
      res.writeHead(404, {
        'content-type': mime,
        'last-modified': 'Fri, 14 Dec 2018 13:00:00 GMT',
        'cache-control': 'max-age=86400',
        'expires': new Date(Date.now() + 86400000).toUTCString(),
      });
      res.write(data);
    }

    // End Connection
    res.end();
  });
}

http.createServer(requestHandler).listen(3000, '127.0.0.1');
console.log('Server running at http://localhost:3000/');
