//url module
const url = require('url');
let addr = request.url;
let q = url.parse(addr, true);

console.log(q.host); // returns 'localhost:8080'
console.log(q.pathname); // returns '/default.html'
console.log(q.search); // returns '?year=2017&month=february'

let qdata = q.query; // returns an object: { year: 2017, month: 'february' }
console.log(qdata.month); // returns 'february'

// fs module
const fs = require("fs");

fs.readFile('log.txt', (err, data) => {
  if (err) {
    throw err;
  }
  console.log('File content: ' + data.toString());
});

//HTTP module
const http = require('http');

http.createServer((request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Hello Node!\n');
}).listen(8080);

console.log('My first Node test server is running on Port 8080.');
