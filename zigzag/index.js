
  // this.writeUnsignedVarint32(((value << 1) ^ (value >> 31)) >>> 0);


const writeUnsignedVarint32 = function(value) {
  // goog.asserts.assert(value == Math.floor(value));
  // goog.asserts.assert((value >= 0) &&
                      // (value < jspb.BinaryConstants.TWO_TO_32));

  let buffer_ = [];
  while (value > 127) {
    buffer_.push((value & 0x7f) | 0x80);
    value = value >>> 7;
  }

  buffer_.push(value);

  return buffer_;
};

const writeSignedVarint32 = function(value) {
  // goog.asserts.assert(value == Math.floor(value));
  // goog.asserts.assert((value >= -jspb.BinaryConstants.TWO_TO_31) &&
  //                     (value < jspb.BinaryConstants.TWO_TO_31));

  // Use the unsigned version if the value is not negative.
  if (value >= 0) {
    writeUnsignedVarint32(value);
    return;
  }
  let buffer_ = [];

  // Write nine bytes with a _signed_ right shift so we preserve the sign bit.
  for (var i = 0; i < 9; i++) {
    buffer_.push((value & 0x7f) | 0x80);
    value = value >> 7;
  }

  // The above loop writes out 63 bits, so the last byte is always the sign bit
  // which is always set for negative numbers.
  buffer_.push(1);

  return buffer_;
};

const ret = writeSignedVarint32(-1 * 2**18);

console.log(ret);