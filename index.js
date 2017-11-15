function a(gen, value) {
  return new Promise((resolve, reject) => {
    const next = gen.next(value)
    if (!next.done) {
      const v = next.value
      const p = v instanceof Promise ? v : Promise.resolve(v)
      return p.then(r => resolve(a(gen, r)))
        .catch(error => gen.throw(error))
    } else {
      resolve(next.value)
    }
  })
}

// generator -> function
function asyncinator(generator) {
  return function(...args) {
    const gen = generator(...args)
    return a(gen)
  }
}

function promiseFunc(timeout, value) {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(value), timeout)
  })
}

const asyncFunc = asyncinator(function*(start) {
  try {
    const first = yield promiseFunc(1000, start)
    const oneAndAHalf = yield first + 100
    const second = yield promiseFunc(1000, oneAndAHalf + 200)

    return second
  } catch (error) {
    console.error('catch in asyncinator', error)
  }
})

asyncFunc(100)
  .then(result => console.log(`Asyncinator func done with value: ${result}`))
  .catch(error => console.error('error asyncinator:', error))
