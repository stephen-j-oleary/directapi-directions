
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

  it("should have expected default properties", done => {
    request = new Request();

    expect(request).to.have.property("params").that.deep.equals({});
    expect(request).to.have.property("body").that.deep.equals({});
    expect(request).to.have.property("headers").that.deep.equals({});
    done();
  })
})
