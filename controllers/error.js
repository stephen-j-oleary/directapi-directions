
import { ValidationError } from "../utils/validate.js";
import { AuthError } from "./authentication.js";
import ApiError from "../utils/ApiError.js";

const jsonValidationError = (err, req, res, next) => {
  if (!(err instanceof ValidationError)) return next(err);

  const { query, body, headers } = req;

  res.status(400).json({
    code: "invalid_request",
    message: "Invalid request",
    received: { query, body, headers },
    error: err
  });
}

const authError = (err, _req, res, next) => {
  if (!(err instanceof AuthError)) return next(err);

  res.status(401).json({
    code: err.code,
    message: err.message,
    data: err.data
  });
}

const apiError = (err, _req, res, next) => {
  if (!(err instanceof ApiError)) return next(err);

  res.status(err.status).json({
    code: err.code,
    message: err.message,
    data: err.data
  });
}

const generalError = (err, _req, res, _next) => {
  res.status(500).json({
    code: "server_error",
    message: err.message,
    data: err
  });
}

export default [
  jsonValidationError,
  authError,
  apiError,
  generalError
]
