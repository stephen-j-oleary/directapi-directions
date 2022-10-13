
import { Validator } from "express-json-validator-middleware";
import ajvErrors from "ajv-errors";

const validator = new Validator({ allErrors: true });
ajvErrors(validator.ajv);

export default validator.validate;

export * from "express-json-validator-middleware";
