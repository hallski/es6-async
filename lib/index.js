function iterateAsync(gen, { value, done }) {
  if (done) {
    return Promise.resolve(value)
  }

  const promise = value instanceof Promise ? value : Promise.resolve(value)
  return promise
    .then(result => iterateAsync(gen, gen.next(result)))
    .catch(error => iterateAsync(gen, gen.throw(error)))
}

function makeAsync(generator) {
  return function(...args) {
    const gen = generator(...args)
    return iterateAsync(gen, gen.next())
  }
}

module.exports = makeAsync
