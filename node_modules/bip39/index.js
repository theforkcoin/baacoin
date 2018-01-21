var bip39 = require('./lib/index')
var pbkdf2 = require('pbkdf2')

bip39.setPbkdf2(function(password, salt, iterations, keylen, digest) {
  var passwordBuffer = new Buffer(password, 'utf8')
  var saltBuffer = new Buffer(salt, 'utf8')

  return pbkdf2.pbkdf2Sync(passwordBuffer, saltBuffer, iterations, keylen, digest)
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
