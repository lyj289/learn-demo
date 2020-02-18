#! /bin/bash

node ./socks5-proxy.js

curl https://www.baidu.com --socks5 127.0.0.1:8888

# or use auth
# curl https://www.baidu.com --socks5 127.0.0.1:8888 --proxy-user admin:123456

