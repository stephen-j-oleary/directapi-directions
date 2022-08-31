
import mongoose from "mongoose";
import mongooseToSwagger from "mongoose-to-swagger";
import crypto from "crypto";
import uniqueValidator from "mongoose-unique-validator";


/**
 * Generates a unique id
 * @returns {string}
 */
const generateId = () => crypto.randomUUID();

/**
 * Generates a unique secret
 * @returns {string}
 */
const generateSecret = () => crypto.randomBytes(256).toString("hex");


const schema = new mongoose.Schema({
  client_id: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
    default: generateId
  },
  client_secret: {
    type: String,
    required: true,
    default: generateSecret
  },
  name: {
    type: String,
    required: true
  },
  redirect_uri: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: String,
    required: true
  }
});


schema.plugin(uniqueValidator);


/**
 * Verifies a given credential value
 * @param {{[fieldName: string]: [expectedValue: string];}} validator
 * @returns {boolean}
 * @example
 *   const isValid = verifyCredentials({
 *     client_secret: "12345"
 *   })
 */
schema.methods.verifyCredentials = function (validator) {
  if (!validator) return false;

  return Object.entries(validator).every(([ name, value ]) => (this[name] === value));
}


const model = mongoose.model("Client", schema);
export const openApiSchema = mongooseToSwagger(model);
export default model;
