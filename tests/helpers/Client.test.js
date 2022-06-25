import { expect } from "../initialize.test.js";
import Client from "../../schemas/Client.js";


describe("model Client", () => {
  describe("validation", () => {
    it("name should be required", () => {
      const c = new Client();

      const res = c.validateSync();
      return expect(res.errors.name).to.exist;
    });

    it("client_id should have default", () => {
      const c = new Client({ redirect_uri: "u" });

      return expect(c).to.have.property("client_id");
    });

    it("client_id should be unique", async () => {
      const c1 = new Client({ name: "n", redirect_uri: "u", user_id: "uid" });
      await c1.save();
      const c2 = new Client({ client_id: c1.client_id, redirect_uri: "uri", user_id: "id" });

      const res = await c2.validate().catch(e => e);
      return expect(res.errors.client_id).to.exist;
    });

    it("client_secret should have default", () => {
      const c = new Client({ redirect_uri: "u" });

      return expect(c).to.have.property("client_secret");
    });

    it("redirect_uri should be required", () => {
      const c = new Client();

      const res = c.validateSync();
      return expect(res.errors.redirect_uri).to.exist;
    });

    it("redirect_uri should be unique", async () => {
      const c1 = new Client({ name: "n", redirect_uri: "u", user_id: "uid" });
      await c1.save();
      const c2 = new Client({ redirect_uri: "u", user_id: "id" });

      const res = await c2.validate().catch(e => e);
      return expect(res.errors.redirect_uri).to.exist;
    });

    it("user_id should be required", () => {
      const c = new Client({ redirect_uri: "u" });

      const res = c.validateSync();
      return expect(res.errors.user_id).to.exist;
    });
  });


  describe("method verifyCredentials", () => {
    const client = new Client({
      redirect_uri: "url"
    });


    it("should return false if missing a validator", () => {
      const result = client.verifyCredentials();

      return expect(result).to.be.false;
    });

    it("should return false if validator fails", () => {
      const result = client.verifyCredentials({ client_secret: "123" });

      return expect(result).to.be.false;
    });

    it("should return true if validator passes", () => {
      const result = client.verifyCredentials({ client_secret: client.client_secret });

      return expect(result).to.be.true;
    });

    it("should handle multiple validator properties", () => {
      const result = client.verifyCredentials({
        client_secret: client.client_secret,
        redirect_uri: client.redirect_uri
      });

      return expect(result).to.be.true;
    });
  });
});