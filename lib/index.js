function iterateAsync(gen, { value, done }) {
  if (done) {
    return Promise.resolve(value)
  }

  const promise = value instanceof Promise ? value : Promise.resolve(value)
  return promise
    .then(result => iterateAsync(gen, gen.next(result)))
    .catch(error => iterateAsync(gen, gen.throw(error)))
}

/**
 * Creates an asynchronous function using the passed generator.
 *
 * This behaves like `async` does in ES7 but takes a generator instead of
 * being a keyword in front of a normal function declaration. Since it's
 * built on generators, use `yield` instead of `await` in order to wait for
 * an asynchronous call to finish.
 *
 * @param {Function} generator the asynchronous function
 */
function makeAsync(generator) {
  return function(...args) {
    const gen = generator(...args)
    return iterateAsync(gen, gen.next())
  }
}

module.exports = makeAsync
