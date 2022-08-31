
import mongoose from "mongoose";
import mongodb from "mongodb";


export default (err, req, res, next) => {
  let { status = 500, error = "server_error", error_message = err.message, errors } = err;

  // Check if error is a mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    if (Object.values(errors)[0]?.kind === "unique") {
      status = 409;
      error = "duplicate_resource";
    } else {
      status = 400;
      error = "invalid_request";
    }
  }
  if (err instanceof mongodb.MongoError) {
    if (err.code === 11000) {
      status = 409;
      error = "duplicate_resource";
    } else {
      status = 500;
      error = "server_error";
    }
  }

  res.status(status).json({ error, error_message });
}
