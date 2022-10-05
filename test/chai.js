
process.env.NODE_ENV = "test";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";
import chaiHttp from "chai-http";
import chaiJsonSchema from "chai-json-schema";

chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.use(chaiHttp);
chai.use(chaiJsonSchema);

export const { expect } = chai;

export default chai;
