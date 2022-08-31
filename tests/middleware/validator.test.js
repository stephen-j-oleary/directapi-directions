
import * as Yup from "yup";
import { sinon, expect } from "../initialize.test.js";
import mw from "../../middleware/validator.js";


describe("mw validator", () => {
  let reqStub, resStub, nextStub;
  const passingSchema = Yup.object().shape({
    body: Yup.object().shape({
      foo: Yup.array(),
      bar: Yup.string().required()
    })
  });
  const failingSchema = Yup.object().shape({
    body: Yup.object().shape({
      abc: Yup.string().required()
    })
  });

  beforeEach(() => {
    reqStub = {
      body: {
        foo: ["array", "of", "strings"],
        bar: "string"
      }
    };
    resStub = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };
    nextStub = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });


  it("should respond with 400 if validation fails", async () => {
    const middleware = mw(failingSchema);

    await middleware(reqStub, resStub, nextStub);

    return Promise.all([
      expect(resStub.status).to.have.been.calledOnceWith(400),
      expect(resStub.json).to.have.been.calledOnce
    ]);
  });

  it("should call next if validation passes", async () => {
    const middleware = mw(passingSchema);

    await middleware(reqStub, resStub, nextStub);

    return expect(nextStub).to.have.been.calledOnce;
  });

  it("should pass options to validate call", async () => {
    const validateStub = sinon.stub(passingSchema, "validate").resolves();
    const options = {
      testOption: true
    };
    const middleware = mw(passingSchema, options);

    await middleware(reqStub, resStub, nextStub);

    return expect(validateStub.args[0][1]).to.deep.equal(options);
  });
});