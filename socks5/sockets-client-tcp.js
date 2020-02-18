/**
 * Send a tcp request by net module
 */

var net = require('net');

var HOST = '127.0.0.1';
var PORT = 6969;

var client = new net.Socket();
client.connect(PORT, HOST, function() {
  console.log('Client CONNECTED TO: ' + HOST + ':' + PORT);
  // Write a message to the socket as soon as the client is connected, the server will receive it as message from the client
 client.write('HI, server, I am Chuck Norris from client!');
});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client.on('data', function(data) {
  console.log('DATA From Server: ' + data);
  // Close the client socket completely
  client.destroy();
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
  console.log('Connection closed');
});