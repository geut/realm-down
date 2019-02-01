const test = require('tape')
const tmp = require('tmp')
const suite = require('./suite')
const realmdown = require('..')

let numSuites = 0

suite({
  test: test,
  factory: function () {
    return realmdown({ path: `${tmp.dirSync().name}/db` })
  },
  setUp: function (t) {
    t.end()
  },
  tearDown: function (t) {
    numSuites++
    t.end()
    if (numSuites === 9) {
      process.exit(0)
    }
  }
})
