
import validate from "../utils/validate.js";
import search from "../services/search/index.js";
import requestSchema from "../schemas/search/request.js";

export const validator = validate({ query: requestSchema });

export const controller = (req, res, next) => {
  return search(req)
    .then(results => res.status(200).json(results))
    .catch(next);
}

export default {
  validator,
  controller
}
