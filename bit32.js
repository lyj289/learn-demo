const max  = 2147483647;
const max1 = 2147483648;

function bit(num) {
  return num.toString(2);
}

console.log('max  ', max, bit(max), bit(max).length);
console.log('max1 ', max1, bit(max1), bit(max1).length);

console.log('max1 sign right >> 1');

const m1 = '1'+bit(max1);
console.log(m1, m1.length);
const m2 = m1.split('').reverse().slice(0, 32).reverse().join('');
console.log('keep 32 bit length, from right to left');
console.log(m2, m2.length);
console.log('负数, 取补码, 反码 + 1');
// 11000000000000000000000000000000 (length=32)
//=-1000000000000000000000000000000
//=-1073741824
// const m3='11000000000000000000000000000000'
// console.log(m3, m3.length);
const maxright1 = max1 >> 1
const m4 = Math.abs(maxright1)
const m5 = '1'+bit(m4);
console.log(m5, m5.length);

console.log();
console.log("Ground Truth: ");
console.log('max1 sign right >> 1: ', maxright1)
const m6 = maxright1 >>> 0
console.log(maxright1, '补码 ');
console.log(bit(m6));
console.log(bit(maxright1), bit(maxright1).length)
console.log('bit of', m4, ':');
console.log('', bit(m4), bit(m4).length);

console.log('0b111011 1111111111111111111111111111111', 0b1110111111111111111111111111111111111);
0b1110111111111111111111111111111111111 >> 1 // -1
