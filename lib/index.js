function iterateAsync(gen, { value, done }) {
  if (done) {
    return Promise.resolve(value)
  }

  return new Promise((resolve, reject) => {
    const promise = value instanceof Promise ? value : Promise.resolve(value)
    return promise
      .then(result => resolve(iterateAsync(gen, gen.next(result))))
      .catch(error => {
        try {
          resolve(iterateAsync(gen, gen.throw(error)))
        } catch (newError) {
          reject(newError)
        }
      })
  })
}

function makeAsync(generator) {
  return function(...args) {
    const gen = generator(...args)
    return iterateAsync(gen, gen.next())
  }
}

module.exports = makeAsync
