
import { Validator } from "express-json-validator-middleware";
import ajvErrors from "ajv-errors";

const { validate } = new Validator();
ajvErrors(validate.ajv);

export default validate;

export * from "express-json-validator-middleware";
