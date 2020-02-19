const net = require('net');
const AUTHMETHODS = {
    NOAUTH: 0,
    USERPASS: 2
}
const ATYPList = {
    IPv4: 0x01,
    DomainName: 0x03,
    IPv6: 0x04,
};

const AUTHINFO = {
    UNAME: 'admin',
    PWD: '123456'
}

const PORT = 8888;

const proxyServer = net.createServer()
proxyServer.on('connection', clientSocket => {

    /**
     * +----+----------+----------+
     * |VER | NMETHODS | METHODS  |
     * +----+----------+----------+
     * | 1  |    1     | 1 to 255 |
     * +----+----------+----------+
     *
     **/

    clientSocket.once('data', data => {
        const ver = parseInt(data[0], 10);
        if (ver !== 5) {
            console.log('Do not Support The Version', ver);
            clientSocket.destoryed || clientSocket.destory();
            return false;
        }
        const methods = data.slice(2);

        /**
         * Send response from proxy to client
         * +----+----------+
         * |VER |  METHODS |
         * +----+----------+
         * | 1  |    1     |
         * +----+----------+
         *
         **/
        if (methods.indexOf(AUTHMETHODS.USERPASS) > -1) {
            clientSocket.write(Buffer.from([5, AUTHMETHODS.USERPASS]))
            // Check auth info
            /**
			 * +----+------+----------+------+----------+
			 * |VER | ULEN |  UNAME   | PLEN |  PASSWD  |
			 * +----+------+----------+------+----------+
			 * | 1  |  1   | 1 to 255 |  1   | 1 to 255 |
			 * +----+------+----------+------+----------+
			 **/
            clientSocket.once('data', authData => {
                const ulen = parseInt(authData[1], 10);
                const uname = authData.slice(2, 2 + ulen).toString();
                const passwd = authData.slice(2 + ulen + 1).toString();

                if (uname === AUTHINFO.UNAME && passwd === AUTHINFO.PWD) {
                    /**
                     * Response after auth successful
                     * +----+----------+
                     * |VER |  STATUS |
                     * +----+----------+
                     * | 1  |    1     |
                     * +----+----------+
                     * STATUS
                     * 0x00 success
                     * 0x01 fail
                     **/
                    clientSocket.write(Buffer.from([authData[0],0x00]))
                    request(clientSocket);
                } else {
                    clientSocket.write(Buffer.from([authData[0],0x01]))
                    return false;
                }
            })
        } else {
            if (methods.indexOf(AUTHMETHODS.NOAUTH) > -1) {
                clientSocket.write(Buffer.from([5, AUTHMETHODS.NOAUTH]))
                request(clientSocket);
            } else {
                clientSocket.write(Buffer.from([0x05, 0xff]));
                return false;
            }
        }
    });

    clientSocket.on('close', () => {
        clientSocket.destroyed || clientSocket.destroy();
    })

    clientSocket.on('error', err => {
        console.error(err);
    })

})

proxyServer.listen(PORT, () => {
    console.log(`Start listening ${PORT} ...`);
})

proxyServer.on('error', err => {
    console.error(err);
})


function request(clientSocket) {
    /**
     * +----+-----+-------+------+----------+----------+
     * |VER | CMD |  RSV  | ATYP | DST.ADDR | DST.PORT |
     * +----+-----+-------+------+----------+----------+
     * | 1  |  1  | X'00' |  1   | Variable |    2     |
     * +----+-----+-------+------+----------+----------+
     *
     * DST.ADDR
     * ATYP == 0x01：4 个字节的 IPv4 地址
     * ATYP == 0x03：1 个字节表示域名长度，紧随其后的是对应的域名
     * ATYP == 0x04：16 个字节的 IPv6 地址
     * DST.PORT 字段：目的服务器的端口
     **/
    // Use once rather than on, or it will trigger multiple
    clientSocket.once('data', requestData => {
        const VERSION = requestData[0];
        const cmd = requestData[1]; // 0x01 先支持 CONNECT连接
        if (cmd !== 1)
            console.error('不支持其他连接 %d', cmd);

        let flag = VERSION === 5 && cmd < 4 && requestData[2] === 0;
        if (!flag)
            return false;

        const atyp = requestData[3];

        let host, port;
        // Buffer.from([1,187]).readInt16BE(0) === 443
        // Buffer.from([1,0xbb]).readInt16BE(0) === 443
        // 0x01bb === 443
        port = requestData.slice(-2).readInt16BE(0);

        // For ipv4
        if (atyp === ATYPList.IPv4) {
            host = requestData.slice(4, 8).join('.');
        }

        // For domain, e.g. www.baidu.com
        if (atyp === ATYPList.DomainName) {
            host = requestData.slice(5, -2).toString();
        }

        // response data is samely format with request data from client
        // and same value, except the second field
        const responseData = Buffer.allocUnsafe(requestData.length);
        requestData.copy(responseData);

        /**
         * +----+-----+-------+------+----------+----------+
         * |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
         * +----+-----+-------+------+----------+----------+
         * | 1  |  1  | X'00' |  1   | Variable |    2     |
         * +----+-----+-------+------+----------+----------+
         *
         * REP
         * X'00' succeeded
         * X'01' general SOCKS server failure
         * X'02' connection not allowed by ruleset
         * X'03' Network unreachable
         * X'04' Host unreachable
         * X'05' Connection refused
         * X'06' TTL expired
         * X'07' Command not supported
         * X'08' Address type not supported
         * X'09' to X'FF' unassigned
         **/
        const serverSocket = net.createConnection(port, host, () => {
            // Response 0x00 if connect successfully
            responseData[1] = 0x00;
            clientSocket.write(responseData);

            clientSocket.pipe(serverSocket);
            serverSocket.pipe(clientSocket);
        })

        serverSocket.setTimeout(60 * 1000);
        serverSocket.on('timeout', err => {
            responseData[1] = 0x06;
            serverSocket.write(responseData);
            serverSocket.destroyed || serverSocket.destroy()
        })
        serverSocket.on('error', err => {
            // Response 0x03 if connect fail
            responseData[1] = 0x03;
            serverSocket.write(responseData);
            serverSocket.destroyed || serverSocket.destroy()
            console.error(err)
        })

        serverSocket.on('close', () => {
            serverSocket.destroyed || serverSocket.destroy()
        })
    })
}