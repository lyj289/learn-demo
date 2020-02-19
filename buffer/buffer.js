const fs = require('fs');
const path = require('path');

function number() {
    let arr = [1, 187]; // As  [0x01, 0xbb]
    let num = Buffer.from(arr).readInt16BE(0);
    console.log(num);
}

function copy() {
    let arr = [1, 187];
    let buffer = Buffer.from(arr);
    let copyBuffer = Buffer.allocUnsafe(buffer.length);
    buffer.copy(copyBuffer);
    console.log(copyBuffer);
}
function string() {
    let arr = 'hello world'
    let buffer = Buffer.from(arr);
    console.log(buffer)
    let str = Buffer.from(buffer).toString();
    console.log(str);
}

function base64() {
    // 将字符串转化为 base64 编码
    let base64 = Buffer.from('hello wrold').toString('base64');
    console.log(base64);
    console.log(Buffer.from(base64, 'base64').toString());
}

function decode_image() {
    let buffer_data = fs.readFileSync(path.join(__dirname, 'logo.svg'));
    let base64 = buffer_data.toString('base64');
    // console.log(base64);
    // console.log(Buffer.from(base64, 'base64').toString());
    fs.writeFileSync(path.join(__dirname, 'logo2.svg'), Buffer.from(base64, 'base64'));
}

function readFile() {
    // 经过测试，没有出现中文乱码的问题
    let rs = fs.createReadStream(path.join(__dirname, 'data.txt'));
    let data = '';
    rs.on('data', function (chunk) {
        data += chunk;
    });
    rs.on('end', function () {
        console.log(data);
    });
}

copy()