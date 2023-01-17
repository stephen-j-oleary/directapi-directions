
import { expect } from "../chai.js";
import Request from "../../services/Request.js";

describe("class Request", () => {
  let request;

  beforeEach(() => {
    request = new Request({
      query: { key: "value" }
    });
  })

  it("should have expected properties", () => {
    return expect(request).to.have.property("query")
      .that.has.property("key")
      .that.equals("value");
  })

  it("should handle missing arguments", () => {
    request = new Request();

    return expect(request).to.be.an.instanceOf(Request);
  })

  it("should have a static create method", () => {
    return expect(Request).to.have.property("create").that.is.a("function");
  })

  it("that returns an instance of Request", () => {
    request = Request.create();

    return expect(request).to.be.an.instanceOf(Request);
  })
})
