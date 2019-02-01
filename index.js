const { AbstractLevelDOWN } = require('abstract-leveldown')
const Realm = require('realm')

class RealmDown extends AbstractLevelDOWN {
  constructor (opts) {
    super()
    this.type = 'KeyValueStore'
    this.realm = null
    this.opts = opts
  }

  _open (opts, cb) {
    Realm.open(Object.assign({}, this.opts, {
      schema: [{
        name: this.type,
        primaryKey: 'key',
        properties: { key: 'string', value: 'data' }
      }]
    }))
      .then(realm => {
        this.realm = realm
        cb(null)
      })
      .catch(err => cb(err))
  }

  _get (key, opts, cb) {
    if (!this._validateRealm(cb)) {
      return null
    }

    const data = this.realm.objectForPrimaryKey(this.type, key)

    if (!data) {
      return process.nextTick(cb, new Error('NotFound'))
    }

    let value = Buffer.from(data.value)

    if (opts.asBuffer === false) {
      value = value.toString()
    }

    return process.nextTick(cb, null, value)
  }

  _put (key, value, opts, cb) {
    if (!this._validateRealm(cb)) {
      return null
    }

    try {
      this.realm.write(() => {
        this.realm.create(this.type, { key, value }, true) // true for update value
      })
      return process.nextTick(cb, null)
    } catch (err) {
      return process.nextTick(cb, err)
    }
  }

  _del (key, opts, cb) {
    if (!this._validateRealm(cb)) {
      return null
    }

    try {
      this.realm.write(() => {
        const data = this.realm.objectForPrimaryKey(this.type, key)
        this.realm.delete(data)
      })
      return process.nextTick(cb, null)
    } catch (err) {
      return process.nextTick(cb, null)
    }
  }

  _batch (operations, opts, cb) {
    if (!this._validateRealm(cb)) {
      return null
    }

    try {
      this.realm.write(() => {
        operations.forEach(operation => {
          if (operation.type === 'put') {
            this.realm.create(this.type, { key: operation.key, value: operation.value }, true)
          } else if (operation.type === 'del') {
            const data = this.realm.objectForPrimaryKey(this.type, operation.key)
            this.realm.delete(data)
          }
        })
      })
      return process.nextTick(cb, null)
    } catch (err) {
      return process.nextTick(cb, err)
    }
  }

  _close (cb) {
    if (!this._validateRealm(cb)) {
      return null
    }

    try {
      this.realm.close()
      return process.nextTick(cb, null)
    } catch (err) {
      return process.nextTick(cb, err)
    }
  }

  _validateRealm (cb) {
    if (!this.realm) {
      process.nextTick(cb, new Error('RealmNotFound'))
      return false
    }

    if (this.realm.isClosed) {
      process.nextTick(cb, new Error('RealmClosed'))
      return false
    }

    return true
  }

  _serializeKey (key) {
    return Buffer.isBuffer(key) ? key.toString() : String(key)
  }

  _serializeValue (value) {
    if (value == null) {
      return Buffer.from('')
    }

    if (Buffer.isBuffer(value)) {
      return value
    }

    return Buffer.from(String(value))
  }
}

module.exports = (...args) => new RealmDown(...args)
