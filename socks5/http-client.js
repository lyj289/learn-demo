// https://nodejs.org/en/knowledge/HTTP/clients/how-to-create-a-HTTP-request/

var http = require('http');

function get() {
    var options = {
        host: 'httpbin.org',
        path: '/get?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new',
        headers: { 'custom': 'Custom Header Demo works' }
    };

    callback = function (response) {
        var str = '';

        //another chunk of data has been received, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been received, so we just print it out here
        response.on('end', function () {
            console.log(str);
        });
    }

    http.request(options, callback).end();

}

function post() {
    //The url we want is `www.nodejitsu.com:1337/`
    var options = {
        host: 'httpbin.org',
        path: '/post',
        method: 'POST'
    };

    callback = function (response) {
        var str = ''
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            console.log(str);
        });
    }

    var req = http.request(options, callback);
    //This is the data we are posting, it needs to be a string or a buffer
    const data = JSON.stringify({
        todo: 'Buy the milk'
    })
    req.write(data);
    req.end();
}
post();