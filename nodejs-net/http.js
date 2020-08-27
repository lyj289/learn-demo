var net = require("net");
var client = new net.Socket();


function clientWrite() {
  client.write(`GET / HTTP/1.0\nConnection: keep-alive\n\n`);
}

function clientWrite2() {
    client.write(`GET / HTTP/1.0
Connection: keep-alive\n\n`);
}

function clientWrite3() {
    client.write(`GET / HTTP/1.0
Connection: keep-alive

`);
}
client.connect(
  80,
  "www.baidu.com",
  function() {
    console.log("Connected");

    // Notice the request content and format, especially the new line
    // if there are some host in the same ip, the Host head is need
    // First format
    clientWrite();
  }
);

client.on("data", function(data) {
  console.log("Received " + data.length + " bytes\n" + data);
});

client.on("close", function() {
  console.log("Connection closed");
});
