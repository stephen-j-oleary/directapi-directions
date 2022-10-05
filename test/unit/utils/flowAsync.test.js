
import { expect } from "../../chai.js";
import sinon from "sinon";
import flowAsync from "../../../utils/flowAsync.js";

describe("module flowAsync", () => {
  let flow, result, fake1, fake2, fake3;
  const expectedResult = 4;

  beforeEach(async () => {
    fake1 = sinon.stub().callsFake(a => a + 1);
    fake2 = sinon.stub().callsFake(async a => a + 1);
    fake3 = sinon.stub().callsFake(async a => a + 1);
    flow = flowAsync(
      fake1,
      fake2,
      fake3
    );

    result = await flow(1);
  })
  afterEach(sinon.restore)

  it("should create a pipe", () => {
    return expect(flow).to.be.a("function");
  })

  it("should call functions in order", () => {
    return sinon.assert.callOrder(fake1, fake2, fake3);
  })

  it("should await any async functions", () => {
    return expect(fake3).to.be.calledWith(3);
  })

  it("should have expected result after pipe is executed", () => {
    return expect(result).to.equal(expectedResult);
  })

  it("should reject with expected message if any function rejects", () => {
    const message = "Error message";
    fake2.callsFake(async () => {
      throw message;
    });

    return expect(flow(1)).to.be.rejectedWith("Error message");
  })

  it("should reject with expected message if any function throws", () => {
    const message = "Error message";
    fake1.callsFake(() => {
      throw message;
    });

    return expect(flow(1)).to.be.rejectedWith("Error message");
  })
})
