
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";
import chaiHttp from "chai-http";
import chaiJsonSchema from "chai-json-schema-ajv";
import config from "../schemas/config.js";

chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.use(chaiHttp);
chai.use(chaiJsonSchema.create(config));

export const { expect } = chai;

export default chai;
