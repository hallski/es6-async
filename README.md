# es6-async ![](https://travis-ci.org/mhallendal/es6-async.svg?branch=master)
Async/Await for ES6 with Generators and Promises

Implements async/await for ES6 (specifically for Node 6.x which is the current Node versions on the three big FaaS providers: AWS Lambda, Google Cloud Functions and Azure Functions).

See [Async/Await with Generators and Promises](http://hallski.org/blog/async-await-with-generators) for a blog post about this project.

## Usage
Write code the same way you write code with `async`/`await` with the difference to use `makeAsync` instead of the `async` keyword and replace `await` with `yield`. Also note that `makeAsync` takes a generator defined with the `function*` syntax.

```javascript
const makeAsync = require('es6-async')

const timeout = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds))
const random = () => Promise.resolve(Math.random())

const asyncFunc = makeAsync(function* () {
  yield timeout(1000)
  return yield random()
})

asyncFunc().then(v => console.log('Finished', v))
```

The same code written using async/await:
```javascript
async function asyncFunc() {
  await timeout(1000)
  return await random()
}

asyncFunc().then(v => console.log('Finished', v))
```

### Caveat
I've found one small difference that needs to be pointed out:

```javascript
const resultGen = yield Promise.resolve(100) + 100
const resultAsync = await Promise.resolve(100) + 100
// resultGen = "[object Promise]100"
// resultAsync = 200
```

In the case of `yield`, Javascript first evaluates `Promise.resolve(100) + 100` which it does by converting both to strings and then sends that to `yield`. The solution to this is to wrap it in parenthesis.

```javascript
const resultGen = (yield Promise.resolve(100)) + 100
// resultGen = 200
```

## Using with Google Cloud Functions
```javascript
const makeAsync = require('es6-async')

const timeout = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds))
const random = () => Promise.resolve(Math.random())

const asyncFunc = makeAsync(function* () {
  yield timeout(1000)
  return yield random()
})

module.exports.randomGen = makeAsync(function*(req, res) {
  res.status(200).send('Random value is: ' + (yield asyncFunc()))
})
```
