const http = require('net');
const port = 3000;
const host = '127.0.0.1';

const requestHandler = (req, res) => {
  console.log("\n REQUEST: ", request);
  res.end(`<html><body><h1>chivingtoninc.github.io</h1></body></html>`);
}

const errHandler = (err) => {
  console.log("\n ERROR: ", err);
  console.log(` Server is listening on: ${port}`);
}

const server = http.createServer(requestHandler);
server.listen(port, errHandler);
