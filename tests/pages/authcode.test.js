
import { expect, axios } from "../initialize.test.js";
import User from "../../schemas/User.js";
import Client from "../../schemas/Client.js";


describe("route authcode", () => {
  const path = "/authcode";
  const email = "email";
  const password = "password";
  const name = "name";
  const redirect_uri = "uri";
  let user, client;

  beforeEach(async () => {
    user = new User({ email, password, name });
    await user.save();
    client = new Client({ name, redirect_uri, user_id: user.user_id });
    await client.save();
  });


  describe("get", () => {
    it("should respond with 400 if missing parameters", async () => {
      const options = {
        params: {}
      };
      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(400),
        expect(res.data).to.have.property("error").and.to.eql("invalid_request")
      ]);
    });

    it("should respond with 401 if authorization header is missing", async () => {
      const options = {
        params: {
          client_id: "cid",
          redirect_uri: "u"
        }
      };
      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 401 if authorization type is invalid", async () => {
      const options = {
        params: {
          client_id: "cid",
          redirect_uri: "u"
        },
        headers: { "Authorization": "Invalid 123" }
      };
      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 401 if authorization credentials are invalid", async () => {
      const options = {
        params: {
          client_id: "cid",
          redirect_uri: "u"
        },
        auth: { username: "u", password: "p" }
      };
      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 401 if client credentials are invalid", async () => {
      const options = {
        params: {
          client_id: "cid",
          redirect_uri: "u"
        },
        auth: { username: email, password }
      };
      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized_client")
      ]);
    });

    it("should respond with 401 if user does not have access to requested scope", async () => {
      const options = {
        params: {
          client_id: client.client_id,
          redirect_uri,
          scope: "invalid"
        },
        auth: { username: email, password }
      };
      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("access_denied")
      ]);
    });

    it("should respond with 200 if user and client are valid", async () => {
      const options = {
        params: {
          client_id: client.client_id,
          redirect_uri
        },
        auth: { username: email, password }
      };
      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(200),
        expect(res.data).to.have.property("code").and.to.be.a("string")
      ]);
    });
  });
});
