
import { expect } from "../../chai.js";
import sinon from "sinon";
import authentication, { AuthError } from "../../../controllers/authentication.js";

describe("mw auth", () => {
  const PROXY_SECRET = process.env.RAPIDAPI_PROXY_SECRET;
  let reqStub, resStub, nextStub;

  beforeEach(async () => {
    reqStub = {
      headers: {},
      header(name) {
        return this.headers[name];
      }
    };
    resStub = {};
    nextStub = sinon.stub();
  })
  afterEach(sinon.restore)

  it("should call next with error if request is missing X-RapidAPI-Proxy-Secret", async () => {
    await authentication(reqStub, resStub, nextStub);

    expect(nextStub).to.have.been.calledOnce;
    expect(nextStub.getCall(0).args).to.have.lengthOf(1);
    return;
  })

  it("should call next with error if X-RapidAPI-Proxy-Secret is invalid", async () => {
    reqStub.headers = { "X-RapidAPI-Proxy-Secret": "Invalid" };

    await authentication(reqStub, resStub, nextStub);

    expect(nextStub).to.have.been.calledOnce;
    expect(nextStub.getCall(0).args).to.have.lengthOf(1);
    return;
  })

  it("should call next with instance of AuthError if auth fails", async () => {
    await authentication(reqStub, resStub, nextStub);

    return expect(nextStub.getCall(0).args[0]).to.be.an.instanceOf(AuthError);
  })

  it("should continue request if X-RapidAPI-Proxy-Secret is valid", async () => {
    reqStub.headers = { "X-RapidAPI-Proxy-Secret": PROXY_SECRET };

    await authentication(reqStub, resStub, nextStub);

    expect(nextStub).to.have.been.calledOnce;
    expect(nextStub.getCall(0).args).to.have.lengthOf(0);
    return;
  })
});
