
import { Validator } from "express-json-validator-middleware";
import ajvErrors from "ajv-errors";
import config from "../schemas/config.js";

const validator = new Validator(config);
ajvErrors(validator.ajv);

export default validator.validate;

export * from "express-json-validator-middleware";
