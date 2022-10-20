
import { expect } from "../../chai.js";
import getWith from "../../../utils/getWith.js";

describe("module getWith", () => {
  it("should get existing property", () => {
    const obj = { a: 1 };

    return expect(getWith(obj, "a")).to.equal(obj.a);
  })

  it("should get deeply nested existing property", () => {
    const obj = { a: [{ b: 1 }] };

    return expect(getWith(obj, "a.0.b")).to.equal(obj.a[0].b);
  })

  it("should return undefined when property is missing", () => {
    const obj = {};

    return expect(getWith(obj, "a")).to.be.undefined;
  })

  it("should return defaultValue when property is missing", () => {
    const defaultValue = "";
    const obj = {};

    return expect(getWith(obj, "a", undefined, defaultValue)).to.equal(defaultValue);
  })

  it("should return undefined when predicate returns false", () => {
    const predicate = () => false;
    const obj = { a: 1 };

    return expect(getWith(obj, "a", predicate)).to.be.undefined;
  })

  it("should return defaultValue when predicate returns false", () => {
    const predicate = () => false;
    const defaultValue = "";
    const obj = { a: 1 };

    return expect(getWith(obj, "a", predicate, defaultValue)).to.equal(defaultValue);
  })
})
