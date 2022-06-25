
import { expect, axios } from "../initialize.test.js";
import User from "../../schemas/User.js";
import Client from "../../schemas/Client.js";

describe("route authorize", () => {
  const path = "/authorize";
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

    it("should respond with 400 if response_type is invalid", async () => {
      const options = {
        params: {
          response_type: "invalid",
          client_id: "cid",
          redirect_uri: "u"
        }
      };
      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(400),
        expect(res.data).to.have.property("error").and.to.eql("invalid_request")
      ]);
    });

    it("should respond with 401 if client credentials are invalid", async () => {
      const options = {
        params: {
          response_type: "code",
          client_id: "cid",
          redirect_uri: "url"
        }
      };
      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized_client")
      ]);
    });

    it("should respond with 302 if client and request are valid", async () => {
      const options = {
        params: {
          response_type: "code",
          client_id: client.client_id,
          redirect_uri: client.redirect_uri
        },
        maxRedirects: 0
      };
      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(302),
        expect(res.headers.location).to.exist
      ]);
    });
  });
});
