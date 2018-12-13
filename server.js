#!/usr/bin/env nodejs
const os = require('os');
const fs = require('fs');
const http = require('http');

http.createServer(function (req, res) {
  console.log("\n\n\n\n REQUEST ", req.host);
  res.writeHead(200, {'Content-Type': 'text/html'});

  fs.readFile(req.uri, null, function(err, data) {
    if (err) {
      res.writeHead(404);
      res.write("File not found.")
    }
    else res.write(data);

    res.end();
  });
}).listen(3000, '127.0.0.1');

console.log('Server running at http://localhost:3000/');
