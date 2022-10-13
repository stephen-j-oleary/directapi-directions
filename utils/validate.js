
import { Validator } from "express-json-validator-middleware";
import ajvErrors from "ajv-errors";

const { validate } = new Validator({ allErrors: true });
ajvErrors(validate.ajv);

export default validate;

export * from "express-json-validator-middleware";
