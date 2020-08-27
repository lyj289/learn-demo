var net = require("net");

let server = net.createServer(sock => {
    sock.on('data', data => {
      sock.write(
          'HTTP/1.0 200 OK\r\n' +
          'Content-Type: text/html; charset=UTF-8\r\n\n'
      );
      sock.write('Hello world, this HTTP Server in Net');
    })
});

server.listen(8991);