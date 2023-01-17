
import validate from "../utils/validate.js";
import autocomplete from "../services/autocomplete/index.js";
import requestSchema from "../schemas/autocomplete/request.js";

export default [
  validate({ query: requestSchema }),
  (req, res, next) => (
    autocomplete(req)
      .then(results => res.status(200).json(results))
      .catch(next)
  )
]
