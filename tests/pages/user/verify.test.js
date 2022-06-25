
import { expect, axios } from "../../initialize.test.js";
import User from "../../../schemas/User.js";
import Client from "../../../schemas/Client.js";


describe("route user/verify", () => {
  const path = "/user/verify";
  const email = "example@email.com";
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
    it("should respond with 400 if missing required parameters", async () => {
      const body = {
        email: "e"
      };
      const res = await axios.post(path, body).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(400),
        expect(res.data).to.have.property("error").and.to.eql("invalid_request")
      ]);
    });

    it("should respond with 401 if authorization header is missing", async () => {
      const body = { email, password };
      const res = await axios.post(path, body).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 401 if authorization type is invalid", async () => {
      const body = { email, password };
      const options = {
        headers: { "Authorizaton": "Invalid 123" }
      };
      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 401 if authorization credentials are invalid", async () => {
      const body = { email, password };
      const options = {
        auth: { username: "u", password: "p" }
      };
      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 401 if user credentials are invalid", async () => {
      const body = { email, password: "p" };
      const options = {
        auth: { username: client.client_id, password: client.client_secret }
      };
      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("access_denied")
      ]);
    });

    it("should respond with 401 if user cannot access requested scope", async () => {
      const body = { email, password, scope: "Invalid" };
      const options = {
        auth: { username: client.client_id, password: client.client_secret }
      };
      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("access_denied")
      ]);
    });

    it("should respond with 201 if user and client credentials are valid", async () => {
      const body = { email, password };
      const options = {
        auth: { username: client.client_id, password: client.client_secret }
      };
      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(201),
        expect(res.data).to.be.an("object")
      ]);
    });
  });
});
