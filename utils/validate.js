
import { Validator } from "express-json-validator-middleware";

const { validate } = new Validator();

export default validate;

export * from "express-json-validator-middleware";
