var common = require('abstract-leveldown/test/common')

function suite (options) {
  var testCommon = common(options)
  var test = testCommon.test

  require('abstract-leveldown/test/factory-test')(test, testCommon)

  require('abstract-leveldown/test/leveldown-test')(test, testCommon)
  require('abstract-leveldown/test/open-test').all(test, testCommon)
  require('abstract-leveldown/test/close-test').all(test, testCommon)

  require('abstract-leveldown/test/put-test').all(test, testCommon)
  require('abstract-leveldown/test/get-test').all(test, testCommon)
  require('abstract-leveldown/test/del-test').all(test, testCommon)
  require('abstract-leveldown/test/put-get-del-test').all(test, testCommon)

  require('abstract-leveldown/test/batch-test').all(test, testCommon)
}

suite.common = common

module.exports = suite
