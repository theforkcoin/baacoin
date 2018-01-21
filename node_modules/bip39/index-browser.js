var bip39 = require('./lib/index')
var sjcl = require('./sjcl')
var assert = require('assert')

// making sure sjcl was build correctly
assert(typeof sjcl.hash.sha512 === "function")

var hmacSHA512 = function (key) {
  var hasher = new sjcl.misc.hmac( key, sjcl.hash.sha512 )
  this.encrypt = function () {
    return hasher.encrypt.apply( hasher, arguments )
  }
}

bip39.setPbkdf2(function(password, salt, iterations, keylen, digest) {
  var Prff
  switch (digest) {
    case 'sha512':
      Prff = hmacSHA512
      break
    default:
      throw new Error("Digest [" + digest + "] not implemented")
  }

  var result = sjcl.misc.pbkdf2(sjcl.codec.utf8String.toBits(password), sjcl.codec.utf8String.toBits(salt), iterations, keylen * 8, Prff)

  return new Buffer(sjcl.codec.hex.fromBits(result), 'hex')
})

module.exports = {
  salt: bip39.salt,
  mnemonicToSeed: bip39.mnemonicToSeed,
  mnemonicToSeedHex: bip39.mnemonicToSeedHex,
  mnemonicToEntropy: bip39.mnemonicToEntropy,
  entropyToMnemonic: bip39.entropyToMnemonic,
  generateMnemonic: bip39.generateMnemonic,
  validateMnemonic: bip39.validateMnemonic
}
