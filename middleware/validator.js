
function validator(location, schema, options = undefined) {
  return async (req, res, next) => {
    try {
      await schema.validate(req[location], options);

      next();
    }
    catch (err) {
      res.status(400).json({
        error: "invalid_request",
        error_message: `Invalid Request: ${err.message}`
      });
    }
  }
}


export default validator;
