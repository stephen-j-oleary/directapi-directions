
import { ValidationError } from "express-json-validator-middleware";
import { AuthError } from "./authentication.js";
import ApiError from "../utils/ApiError.js";

export const jsonValidationError = (err, _, res, next) => {
  if (!(err instanceof ValidationError)) next(err);

  return res.status(400).json({
    code: "invalid_request",
    message: "Invalid request",
    data: err.validationErrors
  });
}

export const authError = (err, _, res, next) => {
  if (!(err instanceof AuthError)) next(err);

  return res.status(401).json({
    code: err.code,
    message: err.message,
    data: err.data
  });
}

export const apiError = (err, _, res, next) => {
  if (!(err instanceof ApiError)) next(err);

  return res.status(err.status).json({
    code: err.code,
    message: err.message,
    data: err.data
  });
}

export const generalError = (err, _, res) => {
  return res.status(500).json({
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
