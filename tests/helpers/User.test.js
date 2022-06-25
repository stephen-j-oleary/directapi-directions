import { expect } from "../initialize.test.js";
import User from "../../schemas/User.js";


describe("model User", () => {
  describe("validation", () => {
    it("email should be required", () => {
      const u = new User();

      const res = u.validateSync();
      return expect(res.errors.email).to.exist;
    });

    it("email should be unique", async () => {
      const u1 = new User({ email: "e", password: "p", name: "n" });
      await u1.save();
      const u2 = new User({ email: "e" });


      const res = await u2.validate().catch(e => e);
      return expect(res.errors.email).to.exist;
    });

    it("password should be required", () => {
      const u = new User();

      const res = u.validateSync();
      return expect(res.errors.password).to.exist;
    });

    it("name should be required", () => {
      const u = new User();

      const res = u.validateSync();
      return expect(res.errors.name).to.exist;
    });

    it("user_id should have default", () => {
      const u = new User();

      return expect(u).to.have.property("user_id");
    });

    it("user_id should be unique", async () => {
      const u1 = new User({ email: "e", password: "p", name: "n" });
      await u1.save();
      const u2 = new User({ user_id: u1.user_id });

      const res = await u2.validate().catch(e => e);
      return expect(res.errors.user_id).to.exist;
    });

    it("scope should have default", () => {
      const u = new User();

      return expect(u).to.have.property("scope");
    });

    it("clients should have default", () => {
      const u = new User();

      return expect(u).to.have.property("clients");
    });
  });


  describe("pre save", () => {
    it("should hash password", () => {
      const u = new User({ email: "e", password: "p", name: "n" });
      const promise = u.save();

      return expect(promise).to.eventually.have.property("password").and.to.not.equal("p");
    });
  });


  describe("method comparePassword", () => {
    const password = "p";
    let user;

    beforeEach(async () => {
      user = new User({
        email: "e",
        password: password,
        name: "n"
      });
      await user.save();
    });


    it("should return false if password doesn't match", () => {
      const result = user.comparePassword("123");

      return expect(result).to.be.false;
    });

    it("should return true if password matches", () => {
      const result = user.comparePassword(password);

      return expect(result).to.be.true;
    });
  });


  describe("method hasScope", () => {
    const user = new User({
      email: "e",
      password: "p",
      scope: [
        "123",
        "abc"
      ]
    });


    it("should return false if user doesn't have single requested scope", () => {
      const result = user.hasScope("def");

      return expect(result).to.be.false;
    });

    it("should return false if user doesn't have all requested scopes", () => {
      const result = user.hasScope("abc def");

      return expect(result).to.be.false;
    });

    it("should return true if user has single requested scope", () => {
      const result = user.hasScope("abc");

      return expect(result).to.be.true;
    });

    it("should return true if user has all requested scopes", () => {
      const result = user.hasScope("abc 123");

      return expect(result).to.be.true;
    });
  })
});