const makeAsync = require('../lib/index')
const assert = require('assert')

describe('Async', function() {
  it('should support yielding non-promise value', function() {
    const testAsync = makeAsync(function* () {
      const value = yield 100
      return value
    })

    return testAsync().then(v => assert.equal(v, 100))
  })

  it('should support yielding promises', function() {
    const testAsync = makeAsync(function* () {
      const value = yield Promise.resolve(200)
      return value
    })

    return testAsync().then(v => assert.equal(v, 200))
  })

  it('should support passing arguments to async function', function() {
    const testAsync = makeAsync(function* (arg1, arg2) {
      return arg1 + arg2
    })

    return testAsync(1000, 2000).then(v => assert.equal(v, 3000))
  })

  it('should support calling other async functions from within an async function', function() {
    const async1 = makeAsync(function * (input) {
      return yield input
    })

    const testAsync = makeAsync(function * () {
      const result = yield async1(250)
      return result
    })

    return testAsync().then(v => assert.equal(v, 250))
  })

  it('should support promise resolving in next iteration', function() {
    const async1 = (value) => new Promise(resolve => setImmediate(() => resolve(value)))

    const testAsync = makeAsync(function* () {
      return yield async1(350)
    })

    return testAsync().then(v => assert.equal(v, 350))
  })

  it('should propagate rejecting promises', function() {
    const testAsync = makeAsync(function* () {
      return yield Promise.reject(new Error('rejected'))
    })

    return testAsync().catch(error => assert.equal(error.message, 'rejected'))
  })

  it('should support try-catch', function() {
    let catchCalledWithError

    const testAsync = makeAsync(function* () {
      try {
        yield Promise.reject(new Error('catch me if you can'))
      } catch (error) {
        catchCalledWithError = error
      }
    })

    return testAsync().then(() => assert.equal(catchCalledWithError.message, 'catch me if you can'))
  })

  it('should support throwing from within the catch block', function() {
    const testAsync = makeAsync(function* () {
      try {
        yield Promise.reject(new Error('catch me and throw me'))
      } catch (error) {
        throw error
      }
    })

    return testAsync().catch(error => assert.equal(error.message, 'catch me and throw me'))
  })

  it('should support continuing yielding values from within the catch block', function() {
    const testAsync = makeAsync(function* () {
      try {
        yield Promise.reject(new Error('catch and move on'))
      } catch (error) {
        assert(error.message, 'catch and move on')
        const value = yield Promise.resolve(450)
        return value
      }
    })

    return testAsync().then(v => assert.equal(v, 450))
  })
})
