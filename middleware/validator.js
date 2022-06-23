
const validator = (schema, options = undefined) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params
    }, options);

    return next();
  }
  catch (err) {
    res.status(400).json({
      error: "invalid_request",
      error_message: `Invalid Request: ${err.message}`
    });
  }
}


export default validator;
