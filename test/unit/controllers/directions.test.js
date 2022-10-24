
import { expect } from "../../chai.js";
import sinon from "sinon";
import axios from "axios";
import directions from "../../../controllers/directions.js";
import responseSchema from "../../../schemas/directions/response.js";

describe("controller directions", () => {
  let reqStub, resStub, nextStub;

  beforeEach(() => {
    reqStub = {
      method: "GET"
    };
    resStub = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    nextStub = sinon.stub();
  });
  afterEach(sinon.restore);


  describe("validator", () => {
    it("should call next with error if validation fails", () => {
      directions.validator(reqStub, resStub, nextStub);

      return expect(nextStub.getCall(0).args).to.have.lengthOf(1);
    });

    it("should call next without error if validation passes", () => {
      reqStub.query = { stops: "string" };

      directions.validator(reqStub, resStub, nextStub);

      return expect(nextStub.getCall(0).args).to.have.lengthOf(0);
    });
  });

  describe("controller", () => {
    it("should have expected response if directions is succesful", async () => {
      await directions.controller(reqStub, resStub, nextStub);

      expect(resStub.status).to.have.been.calledOnceWith(200);
      expect(resStub.json.getCall(0).args[0]).to.have.jsonSchema(responseSchema);
      return;
    }).timeout(5000)

    it("should have expected response if no results are found", async () => {
      const id = axios.interceptors.request.use(req => {
        req.headers = {
          ...req.headers,
          "x-mock-response-id": "2741413-8c6f255a-72a3-40fe-a17a-79253f21beaf", // directions/json no result
        };

        return req;
      }, err => Promise.reject(err));

      await directions.controller(reqStub, resStub, nextStub);

      axios.interceptors.request.eject(id);

      console.log(resStub.json.getCall(0).args[0])

      expect(resStub.status).to.have.been.calledOnceWith(200);
      expect(resStub.json.getCall(0).args[0]).to.have.jsonSchema(responseSchema);
      expect(resStub.json.getCall(0).args[0].routes).to.have.lengthOf(0);
      return;
    }).timeout(5000)
  });
});
