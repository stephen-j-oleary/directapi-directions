const chai = require("../chai.js"),
      expect = chai.expect,
      sinon = require("sinon");

const authMiddleware = require("../../middleware/auth");

describe("mw auth", () => {
  let reqStub, resStub, nextStub;

  afterEach(() => {
    sinon.restore();
  });

  beforeEach(async () => {
    reqStub = {
      headers: {},
      header(name) {
        return this.headers[name];
      }
    };
    resStub = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };
    nextStub = sinon.spy();
  });

  it("should reject if request is missing X-RapidAPI-Proxy-Secret", async () => {
    await authMiddleware(reqStub, resStub, nextStub);

    return Promise.all([
      expect(resStub.status).to.have.been.calledOnceWith(401),
      expect(resStub.json).to.have.been.calledOnce
    ]);
  });

  it("should reject if X-RapidAPI-Proxy-Secret is invalid", async () => {
    reqStub.headers = {
      "X-RapidAPI-Proxy-Secret": "Invalid"
    };

    await authMiddleware(reqStub, resStub, nextStub);

    return Promise.all([
      expect(resStub.status).to.have.been.calledOnceWith(401),
      expect(resStub.json).to.have.been.calledOnce
    ]);
  });

  it("should continue request if X-RapidAPI-Proxy-Secret is valid", async () => {
    reqStub.headers = {
      "X-RapidAPI-Proxy-Secret": "e06c81c0-2340-11ed-81af-ff6320bf3bed"
    };

    await authMiddleware(reqStub, resStub, nextStub);

    return expect(nextStub).to.have.been.calledOnce;
  });
});