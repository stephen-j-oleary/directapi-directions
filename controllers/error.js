
import { ValidationError } from "../utils/validate.js";
import { AuthError } from "./authentication.js";
import ApiError from "../utils/ApiError.js";

export const jsonValidationError = (err, req, res, next) => {
  if (!(err instanceof ValidationError)) return next(err);

  const { query, body, headers } = req;
  const { errors } = err;

  res.status(400).json({
    code: "invalid_request",
    message: "Invalid request",
    data: {
      received: { query, body, headers },
      errors: errors
    }
  });
}

export const authError = (err, _, res, next) => {
  if (!(err instanceof AuthError)) return next(err);

  res.status(401).json({
    code: err.code,
    message: err.message,
    data: err.data
  });
}

export const apiError = (err, _, res, next) => {
  if (!(err instanceof ApiError)) return next(err);

  res.status(err.status).json({
    code: err.code,
    message: err.message,
    data: err.data
  });
}

export const generalError = (err, _, res) => {
  res.status(500).json({
    code: "server_error",
    message: err.message,
    data: err
  });
}

export default {
  jsonValidationError,
  authError,
  apiError,
  generalError
}
