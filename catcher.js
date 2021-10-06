module.exports = async (promise, defaultValue) => (
  await promise.catch(err => {
    console.error(err);
    return defaultValue;
  })
)