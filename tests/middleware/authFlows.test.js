import { sinon, expect } from "../initialize.test.js";
import {
  basic,
  client_basic,
  user_credentials,
  client_credentials,
  access_token
} from "../../middleware/authFlows.js";
import User from "../../schemas/User.js";
import Client from "../../schemas/Client.js";
import AccessToken from "../../helpers/AccessToken.js";


describe("module authFlows", () => {
  afterEach(sinon.restore);


  describe("function basic", () => {
    const user = new User({
      email: "email",
      password: "password"
    });
    let userFindStub, userComparePasswordStub, userHasScopeStub;

    beforeEach(() => {
      userFindStub = sinon.stub(User, "findOne").resolves(user);
      userComparePasswordStub = sinon.stub(User.prototype, "comparePassword").returns(true);
      userHasScopeStub = sinon.stub(User.prototype, "hasScope").returns(true);
    });


    it("should reject if missing authHeader", () => {
      const promise = basic(null, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if an invalid auth type is sent", () => {
      const promise = basic({ headers: { authorization: "Invalid 12345" } }, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if invalid encoding is used", () => {
      const promise = basic({ headers: { authorization: "Basic 12345" } }, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if user could not be found", () => {
      userFindStub.resolves(null);

      const promise = basic({ headers: { authorization: "Basic ZW1haWw6cGFzc3dvcmQ" } }, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if user credentials are invalid", () => {
      userComparePasswordStub.returns(false);

      const promise = basic({ headers: { authorization: "Basic ZW1haWw6cGFzc3dvcmQ" } }, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if user does not have authorized scope", () => {
      userHasScopeStub.returns(false);

      const promise = basic({ headers: { authorization: "Basic ZW1haWw6cGFzc3dvcmQ" } }, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should resolve with user_id", () => {
      const promise = basic({ headers: { authorization: "Basic ZW1haWw6cGFzc3dvcmQ" } }, "scope");

      return expect(promise).to.eventually.be.an("object")
        .with.property("user_id");
    });

    it("should call User.findOne once", async () => {
      await basic({ headers: { authorization: "Basic ZW1haWw6cGFzc3dvcmQ" } }, "scope");

      return expect(userFindStub).to.be.calledOnceWith({ $or: [
        { user_id: user.email },
        { email: user.email }
      ] });
    });

    it("should call user.comparePassword once", async () => {
      await basic({ headers: { authorization: "Basic ZW1haWw6cGFzc3dvcmQ" } }, "scope");

      return expect(userComparePasswordStub).to.be.calledOnceWith("password");
    });

    it("should call user.hasScope once", async () => {
      await basic({ headers: { authorization: "Basic ZW1haWw6cGFzc3dvcmQ" } }, "scope");

      return expect(userHasScopeStub).to.be.calledOnceWith("scope");
    });
  });


  describe("function client_basic", () => {
    const client = new Client({
      redirect_uri: "url"
    });
    let clientFindStub, clientVerifyCredentialsStub;

    beforeEach(() => {
      clientFindStub = sinon.stub(Client, "findOne").resolves(client);
      clientVerifyCredentialsStub = sinon.stub(Client.prototype, "verifyCredentials").returns(true);
    });


    it("should reject if missing authHeader", () => {
      const promise = client_basic();

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if an invalid auth type is sent", () => {
      const promise = client_basic({ headers: { authorization: "Invalid 12345" } });

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if invalid encoding is used", () => {
      const promise = client_basic({ headers: { authorization: "Basic 12345" } });

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if user could not be found", () => {
      clientFindStub.resolves(null);

      const promise = client_basic({ headers: { authorization: "Basic ZW1haWw6cGFzc3dvcmQ" } });

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if user credentials are invalid", () => {
      clientVerifyCredentialsStub.returns(false);

      const promise = client_basic({ headers: { authorization: "Basic ZW1haWw6cGFzc3dvcmQ" } });

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should resolve with client_id", () => {
      const promise = client_basic({ headers: { authorization: "Basic ZW1haWw6cGFzc3dvcmQ" } });

      return expect(promise).to.eventually.be.an("object")
        .with.property("client_id");
    });

    it("should call Client.findOne once", async () => {
      await client_basic({ headers: { authorization: "Basic ZW1haWw6cGFzc3dvcmQ" } });

      return expect(clientFindStub).to.be.calledOnce;
    });

    it("should call client.verifyCredentials once", async () => {
      await client_basic({ headers: { authorization: "Basic ZW1haWw6cGFzc3dvcmQ" } });

      return expect(clientVerifyCredentialsStub).to.be.calledOnce;
    });
  });


  describe("function user_credentials", () => {
    const user = new User({
      email: "email",
      password: "password"
    });
    let userFindStub, userComparePasswordStub, userHasScopeStub;

    beforeEach(() => {
      userFindStub = sinon.stub(User, "findOne").resolves(user);
      userComparePasswordStub = sinon.stub(User.prototype, "comparePassword").returns(true);
      userHasScopeStub = sinon.stub(User.prototype, "hasScope").returns(true);
    });


    it("should reject if missing email or password", () => {
      const promise = user_credentials(null, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if user could not be found", () => {
      userFindStub.resolves(null);

      const promise = user_credentials({ body: { email: "root", password: "root" } }, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if user credentials are invalid", () => {
      userComparePasswordStub.returns(false);

      const promise = user_credentials({ body: { email: "root", password: "root" } }, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if user does not have authorized scope", () => {
      userHasScopeStub.returns(false);

      const promise = user_credentials({ body: { email: "root", password: "root" } }, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should resolve with user_id", () => {
      const promise = user_credentials({ body: { email: "root", password: "root" } }, "scope");

      return expect(promise).to.eventually.be.an("object")
        .with.property("user_id");
    });

    it("should call User.findOne once", async () => {
      await user_credentials({ body: { email: "root", password: "root" } }, "scope");

      return expect(userFindStub).to.be.calledOnceWith({ email: "root" });
    });

    it("should call user.comparePassword once", async () => {
      await user_credentials({ body: { email: "root", password: "root" } }, "scope");

      return expect(userComparePasswordStub).to.have.been.calledOnceWith("root");
    });

    it("should call user.hasScope once", async () => {
      await user_credentials({ body: { email: "root", password: "root" } }, "scope");

      return expect(userHasScopeStub).to.have.been.calledOnceWith("scope");
    });
  });


  describe("function client_credentials", () => {
    const user = new Client({
      name: "name",
      redirect_uri: "url",
      user_id: "uid"
    });
    let clientFindStub, clientVerifyCredentialsStub;

    beforeEach(() => {
      clientFindStub = sinon.stub(Client, "findOne").resolves(user);
      clientVerifyCredentialsStub = sinon.stub(Client.prototype, "verifyCredentials").returns(true);
    });


    it("should reject if missing client_id or client_secret", () => {
      const promise = client_credentials();

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if client could not be found", () => {
      clientFindStub.resolves(null);

      const promise = client_credentials({ body: { client_id: "root", client_secret: "root" } });

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if client credentials are invalid", () => {
      clientVerifyCredentialsStub.returns(false);

      const promise = client_credentials({ body: { client_id: "root", client_secret: "root" } });

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should resolve with client_id", () => {
      const promise = client_credentials({ body: { client_id: "root", client_secret: "root" } });

      return expect(promise).to.eventually.be.an("object")
        .with.property("client_id");
    });

    it("should call Client.findOne once", async () => {
      await client_credentials({ body: { client_id: "root", client_secret: "root" } });

      return expect(clientFindStub).to.be.calledOnceWith({ client_id: "root" });
    });

    it("should call client.verifyCredentials once", async () => {
      await client_credentials({ body: { client_id: "root", client_secret: "root" } });

      return expect(clientVerifyCredentialsStub).to.have.been.calledOnceWith({ client_secret: "root" });
    });
  });


  describe("function access_token", () => {
    const payload = { client_id: "client_id", user_id: "user_id", scope: "scope" };
    let token, validateTokenStub, verifyTokenStub, readTokenStub;

    beforeEach(() => {
      token = AccessToken.generate(payload).token;
      validateTokenStub = sinon.stub(AccessToken, "validate").returns(true);
      verifyTokenStub = sinon.stub(AccessToken, "validatePayload").returns(true);
      readTokenStub = sinon.stub(AccessToken, "read").returns(payload);
    });


    it("should reject if missing authHeader", () => {
      const promise = access_token(null, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if an invalid auth type is sent", () => {
      const promise = access_token({ headers: { authorization: "Invalid 12345" } }, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if token is invalid", () => {
      validateTokenStub.returns(false);

      const promise = access_token({ headers: { authorization: "Bearer 12345" } }, "scope");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should reject if token does not have authorized scope", () => {
      verifyTokenStub.returns(false);

      const promise = access_token({ headers: { authorization: `Bearer ${token}` } }, "scope2");

      return expect(promise).to.be.rejectedWith(Error);
    });

    it("should resolve with user_id and client_id", () => {
      const promise = access_token({ headers: { authorization: `Bearer ${token}` } }, "scope");

      return expect(promise).to.eventually.be.an("object")
        .with.all.keys([ "user_id", "client_id" ]);
    });

    it("should call Token.validate once", async () => {
      await access_token({ headers: { authorization: `Bearer ${token}` } }, "scope");

      return expect(validateTokenStub).to.be.calledOnceWith(token);
    });

    it("should call Token.verifyPayload once", async () => {
      await access_token({ headers: { authorization: `Bearer ${token}` } }, "scope");

      return expect(verifyTokenStub).to.be.calledOnce;
    });

    it("should call Token.read once", async () => {
      await access_token({ headers: { authorization: `Bearer ${token}` } }, "scope");

      return expect(readTokenStub).to.be.calledOnceWith(token);
    });
  });
});