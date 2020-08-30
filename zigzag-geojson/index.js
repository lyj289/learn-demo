const encode = require('./encode.js');
const decode = require('./decode.js');
const fs = require('fs');

function readGeoJSONData(fileName) {
    return JSON.parse(fs.readFileSync(fileName, 'utf-8'));
}

// Test encode
const polygon = readGeoJSONData('./data.json');

const encodeJson = JSON.stringify(encode(polygon));

fs.writeFileSync(
    './encodeOutput.json',
    encodeJson,
    'utf-8'
);

// Test decode

const polygon2 = readGeoJSONData('./encodeOutput.json');

const decodeJson = JSON.stringify(decode(polygon2));

fs.writeFileSync(
    './decodeOutput.json',
    decodeJson,
    'utf-8'
);