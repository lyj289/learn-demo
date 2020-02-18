/**
 * Send a http request by net module, it is equal curl url
 */

var net = require("net");
var client = new net.Socket();
client.connect(
  80,
  "localhost",
  function() {
      console.log("Connected");
      // client.write(`Hello!`);
      client.write(`GET / HTTP/1.1
Host: localhost

`);
      // or
      // client.write(`GET / HTTP/1.1\nHost: localhost\n\n`);
      // or
      // client.write('GET / HTTP/1.1\r\n' +
                  //  'Host: localhost\r\n' +
                  //  '\r\n');
});

client.on("data", function(data) {
    console.log("Received " + data.length + " bytes\n" + data);
});

client.on("close", function() {
  console.log("Connection closed");
});