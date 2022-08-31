
import { expect, axios } from "../initialize.test.js";
import User from "../../schemas/User.js";
import Client from "../../schemas/Client.js";

describe("route client", () => {
  const path = "/client";
  const email = "email";
  const password = "password";
  const name = "name";
  const redirect_uri = "http://redirect.uri";
  let user, client;

  beforeEach(async () => {
    user = new User({ email, password, name });
    await user.save();
    client = new Client({ name, redirect_uri, user_id: user.user_id });
    await client.save();
  });


  describe("get", () => {
    it("should respond with 401 with invalid authorization type", async () => {
      const options = {
        headers: { "Authorization": "Invalid 12345" }
      }

      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 401 with invalid authorization credentials", async () => {
      const options = {
        auth: { username: "e", password: "p" }
      };

      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 404 if client not found", async () => {
      const options = {
        auth: { username: email, password }
      };

      const res = await axios.get(`${path}/id`, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(404),
        expect(res.data).to.have.property("error").and.to.eql("resource_not_found")
      ]);
    });

    it("should respond with 200 with valid authorization", async () => {
      const options = {
        auth: { username: email, password }
      };

      const res = await axios.get(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(200),
        expect(res.data).to.be.an("array")
      ]);
    });
  });


  describe("post", () => {
    it("should respond with 415 if content-type is not supported", async () => {
      const body = {};
      const options = {
        headers: { "Content-Type": "application/merge-patch+json" }
      };

      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(415)
      ]);
    });

    it("should respond with 400 if missing properties", async () => {
      const body = { user_id: user.user_id };
      const options = {
        auth: { username: email, password }
      };

      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(400),
        expect(res.data).to.have.property("error").and.to.eql("invalid_request")
      ]);
    });

    it("should respond with 401 with invalid authorization type", async () => {
      const body = {
        name,
        redirect_uri: "http://url.com",
        user_id: user.user_id
      };
      const options = {
        headers: { "Authorization": "Invalid 12345" }
      }

      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 401 with invalid authorization credentials", async () => {
      const body = {
        name,
        redirect_uri: "http://url.com",
        user_id: user.user_id
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

    it("should respond with 409 if client exists", async () => {
      const body = {
        name,
        redirect_uri,
        user_id: user.user_id
      };
      const options = {
        auth: { username: email, password }
      };

      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(409),
        expect(res.data).to.have.property("error").and.to.eql("duplicate_resource")
      ]);
    });

    it("should respond with 201 if client was created", async () => {
      const body = {
        name: "name",
        redirect_uri: "http://url.com",
        user_id: user.user_id
      };
      const options = {
        auth: { username: email, password }
      };

      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(201),
        expect(res.data).to.be.an("object")
      ]);
    });
  });


  describe("patch", () => {
    it("should respond with 415 if content-type is not supported", async () => {
      const body = {};
      const options = {
        headers: { "Content-Type": "application/json" }
      };

      const res = await axios.patch(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(415)
      ]);
    });

    it("should respond with 400 if url parameters are invalid or missing", async () => {
      const body = {};
      const options = {
        headers: { "Content-Type": "application/json-patch+json" },
        auth: { username: email, password }
      };

      const res = await axios.patch(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(400),
        expect(res.data).to.have.property("error").and.to.eql("invalid_request")
      ]);
    });

    it("should respond with 400 if body parameters are invalid or missing", async () => {
      const body = [
        { op: "invalid", value: "123" }
      ];
      const options = {
        headers: { "Content-Type": "application/json-patch+json" },
        auth: { username: email, password }
      };

      const res = await axios.patch(`${path}/${client.client_id}`, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(400),
        expect(res.data).to.have.property("error").and.to.eql("invalid_request")
      ]);
    });

    it("should respond with 401 with invalid authorization type", async () => {
      const body = {};
      const options = {
        headers: {
          "Content-Type": "application/json-patch+json",
          "Authorization": "Invalid 12345"
        }
      };

      const res = await axios.patch(`${path}/${client.client_id}`, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });


    it("should respond with 401 with invalid authorization credentials", async () => {
      const body = {};
      const options = {
        headers: { "Content-Type": "application/json-patch+json" },
        auth: { username: "e", password: "p" }
      };

      const res = await axios.patch(`${path}/${client.client_id}`, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 409 if client already exists", async () => {
      const client2 = new Client({ name: "name", redirect_uri: "uri2", user_id: user.user_id });
      await client2.save();
      const body = [
        { op: "add", path: "/redirect_uri", value: "uri2" }
      ];
      const options = {
        headers: { "Content-Type": "application/json-patch+json" },
        auth: { username: email, password }
      };

      const res = await axios.patch(`${path}/${client.client_id}`, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(409),
        expect(res.data).to.have.property("error").and.to.eql("duplicate_resource")
      ]);
    });

    it("should respond with 201 if client was modified", async () => {
      const body = [
        { op: "replace", path: "/redirect_uri", value: "new_uri" }
      ];
      const options = {
        headers: { "Content-Type": "application/json-patch+json" },
        auth: { username: email, password }
      };
      const res = await axios.patch(`${path}/${client.client_id}`, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(201),
        expect(res.data).to.be.an("object")
      ]);
    });
  });


  describe("delete", () => {
    it("should respond with 400 if url parameters are invalid or missing", async () => {
      const options = {
        auth: { username: email, password }
      };

      const res = await axios.delete(path, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(400),
        expect(res.data).to.have.property("error").and.to.eql("invalid_request")
      ]);
    });

    it("should respond with 401 with invalid authorization type", async () => {
      const options = {
        headers: { "Authorization": "Invalid 12345" }
      };

      const res = await axios.delete(`${path}/${client.client_id}`, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });


    it("should respond with 401 with invalid authorization credentials", async () => {
      const options = {
        auth: { username: "e", password: "p" }
      };

      const res = await axios.delete(`${path}/${client.client_id}`, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 404 if client not found", async () => {
      const options = {
        auth: { username: email, password }
      };

      const res = await axios.delete(`${path}/id`, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(404),
        expect(res.data).to.have.property("error").and.to.eql("resource_not_found")
      ]);
    });

    it("should respond with 204 if client was deleted", async () => {
      const options = {
        auth: { username: email, password }
      };

      const res = await axios.delete(`${path}/${client.client_id}`, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(201),
        expect(res.data).to.be.an("object").and.to.have.keys(["client_id"])
      ]);
    });
  });
});
