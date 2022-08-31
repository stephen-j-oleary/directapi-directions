import { expect, axios } from "../initialize.test.js";
import User from "../../schemas/User.js";
import Client from "../../schemas/Client.js";
import AuthCode from "../../helpers/AuthCode.js";

describe("route token", () => {
  const path = "/token";
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

  describe("post", () => {
    it("should respond with 400 if missing parameters", async () => {
      const body = {};
      const options = {
        auth: { username: client.client_id, password: client.client_secret }
      };
      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(400),
        expect(res.data).to.have.property("error").and.to.eql("invalid_request")
      ]);
    });

    it("should respond with 400 with invalid grant_type", async () => {
      const body = {
        grant_type: "invalid",
        code: "code",
        redirect_uri: redirect_uri,
        client_id: client.client_id
      };
      const options = {
        auth: { username: client.client_id, password: client.client_secret }
      };
      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(400),
        expect(res.data).to.have.property("error").and.to.eql("invalid_request")
      ]);
    });

    it("should respond with 400 with invalid authorization code", async () => {
      const body = {
        grant_type: "authorization_code",
        code: "code",
        redirect_uri: redirect_uri,
        client_id: client.client_id
      };
      const options = {
        auth: { username: client.client_id, password: client.client_secret }
      };
      const res = await axios.post(path, body, options).catch(e => e.response);

      console.log(res);

      return Promise.all([
        expect(res).to.have.status(400),
        expect(res.data).to.have.property("error").and.to.eql("invalid_grant")
      ]);
    });

    it("should respond with 401 with invalid authorization type", async () => {
      const body = {
        grant_type: "authorization_code",
        code: "code",
        redirect_uri: redirect_uri,
        client_id: client.client_id
      };
      const options = {
        headers: { "Authorization": "Invalid 12345" }
      };
      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 401 with invalid authorization credentials", async () => {
      const body = {
        grant_type: "authorization_code",
        code: "code",
        redirect_uri: redirect_uri,
        client_id: client.client_id
      };
      const options = {
        auth: { username: "e", password: "p" }
      };
      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 401 if client_id doesn't match authorized client", async () => {
      const body = {
        grant_type: "authorization_code",
        code: "code",
        redirect_uri: "redirect",
        client_id: "client"
      };
      const options = {
        auth: { username: client.client_id, password: client.client_secret }
      };
      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("invalid_client")
      ]);
    });

    it("should respond with 200 with valid authorization", async () => {
      const { token: code } = AuthCode.generate({ client_id: client.client_id, redirect_uri: redirect_uri, user_id: user.user_id, scope: "" });
      const body = {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
        client_id: client.client_id
      };
      const options = {
        auth: { username: client.client_id, password: client.client_secret }
      };
      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(200),
        expect(res.data).to.be.an("object")
      ]);
    });
  });
});