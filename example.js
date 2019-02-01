const levelup = require('levelup')
const randomAccessKeyValue = require('random-access-key-value')
const hypercore = require('hypercore')
const tmp = require('tmp')
const realmdown = require('.')

var db = levelup(realmdown({ path: `${tmp.dirSync().name}/db` }))

function run (cb) {
  console.log('example using levelup \n')
  db.put('foo', 'bar', function (err) {
    if (err) throw err

    db.get('foo', function (err, value) {
      if (err) throw err

      console.log(value.toString()) // 'bar'
      cb()
    })
  })
}

function runHypercore () {
  console.log('\nexample using hypercore\n')

  const storage = filename => randomAccessKeyValue(db, filename)
  const feed = hypercore(storage, { valueEncoding: 'utf8' })

  feed.append('hello')
  feed.append('world', function (err) {
    if (err) throw err
    feed.get(0, console.log) // prints hello
    feed.get(1, console.log) // prints world
  })
}

run(runHypercore)
