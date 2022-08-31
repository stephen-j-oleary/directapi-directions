process.env.NODE_ENV = "test";

const chai = require("chai"),
      chaiAsPromised = require("chai-as-promised"),
      sinonChai = require("sinon-chai"),
      chaiHttp = require("chai-http");

chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.use(chaiHttp);

module.exports = chai;