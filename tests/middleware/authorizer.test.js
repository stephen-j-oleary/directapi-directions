
import { sinon, expect } from "../initialize.test.js";
import mw from "../../middleware/authorizer.js";


describe("mw authorizer", () => {
  let reqStub, resStub, nextStub, basicStub, clientBasicStub, userCredentialsStub, clientCredentialsStub, accessTokenStub;

  beforeEach(() => {
    const user_id = "user_id",
          client_id = "client_id";

    basicStub = sinon.stub().resolves({ user_id });
    clientBasicStub = sinon.stub().resolves({ client_id });
    userCredentialsStub = sinon.stub().resolves({ user_id });
    clientCredentialsStub = sinon.stub().resolves({ client_id });
    accessTokenStub = sinon.stub().resolves({ user_id, client_id });
    reqStub = {
      headers: {
        authorization: "Basic 12345"
      }
    };
    resStub = {
      locals: {},
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };
    nextStub = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });


  it("should respond with 401 if all flows fail", async () => {
    basicStub.rejects(new Error());
    userCredentialsStub.rejects(new Error());
    accessTokenStub.rejects(new Error());
    const middleware = mw([basicStub, userCredentialsStub, accessTokenStub], "scope");

    await middleware(reqStub, resStub, nextStub);

    return Promise.all([
      expect(resStub.status).to.have.been.calledOnceWith(401),
      expect(resStub.json).to.have.been.calledOnce
    ]);
  });

  it("should set returned authorized_user_id and/or authorized_client_id in res.locals", async () => {
    const middleware = mw(basicStub, "scope");

    await middleware(reqStub, resStub, nextStub);

    return expect(resStub.locals).to.have.keys([ "authorized_user_id", "authorized_client_id" ]);
  });

  it("should call next if any flow passes", async () => {
    userCredentialsStub.rejects(new Error());
    accessTokenStub.rejects(new Error());
    const middleware = mw([basicStub, userCredentialsStub, accessTokenStub], "scope");

    await middleware(reqStub, resStub, nextStub);

    return expect(nextStub).to.have.been.calledOnce;
  });

  it("should call each flow passed in", async () => {
    const middleware = mw([basicStub, userCredentialsStub, accessTokenStub], "scope");

    await middleware(reqStub, resStub, nextStub);

    return Promise.all([
      expect(basicStub).to.have.been.calledOnce,
      expect(userCredentialsStub).to.have.been.calledOnce,
      expect(accessTokenStub).to.have.been.calledOnce
    ]);
  });
});