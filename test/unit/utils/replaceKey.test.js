
import replaceKey from "../../../utils/replaceKey.js";
import { expect } from "../../chai.js";

describe("module replaceKey", () => {
  let obj;

  beforeEach(() => {
    obj = { a: 1, b: 2 };
  })

  it("should remove oldKey", () => {
    replaceKey(obj, "b", "c");

    return expect(obj).to.not.have.property("b");
  })

  it("should add newKey", () => {
    replaceKey(obj, "b", "c");

    return expect(obj).to.have.property("c");
  })

  it("should keep value", () => {
    replaceKey(obj, "b", "c");

    return expect(obj.c).to.equal(2);
  })

  it("should handle nested properties", () => {
    replaceKey(obj, "b", "c.value");

    return expect(obj).to.have.property("c").that.has.property("value");
  })

  it("should handle undefined oldKey", () => {
    replaceKey(obj, "c", "d");

    return expect(obj).to.have.property("d").that.is.undefined;
  })
})
