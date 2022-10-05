
process.env.NODE_ENV = "test";

import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";
import chaiHttp from "chai-http";

chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.use(chaiHttp);

export const { expect } = chai;

export default chai;
