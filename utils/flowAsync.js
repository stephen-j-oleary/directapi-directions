
/**
 * @function flowStep
 * @param {*} input The input or the result of the previous function in the pipeline
 * @returns {Promise<*>|*} The result that will be passed to the next function or returned
 */

/**
 * Creates a pipeline from the given functions. Can be passed sync or async functions
 * @param {...Function} funcs
 * @returns {flowStep}
 */
export default (...funcs) => input => (
  funcs.reduce(async (curr, f) => f(await curr), input)
)
