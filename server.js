#!/usr/bin/env nodejs
const os = require('os');
const fs = require('fs');
const url = require('url');
const http = require('http');


const requestHandler = (req, res) => {
  const uri = url.parse(req.url).pathname;
  const exists = fs.existsSync(`./${uri}`);
  const resource = uri == "/" ? "./index.html" : (exists ? `.${uri}` : `./index.html`);

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

  console.log("\n URI: ", uri);
  console.log("\n RESOURCE: ", resource);
  console.log("\n TYPE: ", mime);

  res.writeHead(200, {
    'content-type': mime,
    'cache-control': 'max-age=600',
    'last-modified': 'Fri, 14 Dec 2018 13:00:00 GMT'
  });

  fs.readFile(resource, null, function(err, data) {
    if (err) {
      res.writeHead(404);
      res.write("File not found.");
    }
    else res.write(data);
    res.end();
  });
}


http.createServer(requestHandler).listen(3000, '127.0.0.1');
console.log('Server running at http://localhost:3000/');
