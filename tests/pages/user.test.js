import { expect, axios } from "../initialize.test.js";
import User from "../../schemas/User.js";
import Client from "../../schemas/Client.js";

describe("route user", () => {
  const path = "/user";
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

    it("should respond with 401 if requested user is not authorized", async () => {
      const options = {
        auth: { username: email, password }
      };

      const res = await axios.get(`${path}/id`, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
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

    it("should respond with 401 if authorization header is missing", async () => {
      const body = { name, email, password };

      const res = await axios.post(path, body).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 401 if authorization type is invalid", async () => {
      const body = { name, email, password };
      const options = {
        headers: { "Authorization": "Invalid 123" }
      };

      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 401 if authorization credentials are invalid", async () => {
      const body = { name, email, password };
      const options = {
        auth: { username: "u", password: "p" }
      };

      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 409 if client exists", async () => {
      const body = { name, email, password };
      const options = {
        auth: { username: client.client_id, password: client.client_secret }
      };

      const res = await axios.post(path, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(409),
        expect(res.data).to.have.property("error").and.to.eql("duplicate_resource")
      ]);
    });

    it("should respond with 201 if user was created", async () => {
      const body = {
        name,
        email: "example2@email.com",
        password
      };
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
        auth: { username: email, password },
      };

      const res = await axios.patch(`${path}/${user.user_id}`, body, options).catch(e => e.response);

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

      const res = await axios.patch(`${path}/${user.user_id}`, body, options).catch(e => e.response);

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

      const res = await axios.patch(`${path}/${user.user_id}`, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 409 if user already exists", async () => {
      const user2 = new User({ email: "email_2", password: "pass", name: "n" });
      await user2.save();
      const body = [
        { op: "add", path: "/email", value: "email_2" }
      ];
      const options = {
        headers: { "Content-Type": "application/json-patch+json" },
        auth: { username: email, password }
      };

      const res = await axios.patch(`${path}/${user.user_id}`, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(409),
        expect(res.data).to.have.property("error").and.to.eql("duplicate_resource")
      ]);
    });

    it("should respond with 201 if user was modified", async () => {
      const body = [
        { op: "replace", path: "/password", value: "new_password" }
      ];
      const options = {
        headers: { "Content-Type": "application/json-patch+json" },
        auth: { username: email, password }
      };

      const res = await axios.patch(`${path}/${user.user_id}`, body, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(201),
        expect(res.data).to.be.an("object")
      ]);
    });
  });


  describe("delete", () => {
    it("should respond with 400 if url parameters are missing or invalid", async () => {
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

      const res = await axios.delete(`${path}/${user.user_id}`, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });


    it("should respond with 401 with invalid authorization credentials", async () => {
      const options = {
        auth: { username: "e", password: "p" }
      };

      const res = await axios.delete(`${path}/${user.user_id}`, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(401),
        expect(res.data).to.have.property("error").and.to.eql("unauthorized")
      ]);
    });

    it("should respond with 404 if user not found", async () => {
      const options = {
        auth: { username: email, password }
      };

      const res = await axios.delete(`${path}/id`, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(404),
        expect(res.data).to.have.property("error").and.to.eql("resource_not_found")
      ]);
    });

    it("should respond with 201 if user was deleted", async () => {
      const options = {
        auth: { username: email, password }
      };
      const res = await axios.delete(`${path}/${user.user_id}`, options).catch(e => e.response);

      return Promise.all([
        expect(res).to.have.status(201),
        expect(res.data).to.be.an("object").and.to.have.keys(["user_id"])
      ]);
    });
  });
});