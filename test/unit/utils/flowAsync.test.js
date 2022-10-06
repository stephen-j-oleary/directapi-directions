
import { expect } from "../../chai.js";
import sinon from "sinon";
import flowAsync from "../../../utils/flowAsync.js";

describe("module flowAsync", () => {
  let flow, fake1, fake2, fake3;
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
  })
  afterEach(sinon.restore)

  it("should create a pipe", async () => {
    const result = await flow(1);

    return expect(flow).to.be.a("function");
  })

  it("should call functions in order", async () => {
    const result = await flow(1);

    return sinon.assert.callOrder(fake1, fake2, fake3);
  })

  it("should await any async functions", async () => {
    const result = await flow(1);

    return expect(fake3).to.be.calledWith(3);
  })

  it("should have expected result after pipe is executed", async () => {
    const result = await flow(1);

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

  it("should stop chain of calls if any function rejects", async () => {
    const message = "Error message";
    fake2.callsFake(async () => {
      throw message;
    });

    await flow(1).catch(() => {});

    return expect(fake3).to.not.be.called;
  })
})
