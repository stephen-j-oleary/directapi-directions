
import { expect } from "../../chai.js";
import sinon from "sinon";
import axios from "axios";
import autocomplete from "../../../controllers/autocomplete.js";
import responseSchema from "../../../schemas/autocomplete/response.js";

async function callAutocomplete(req, res, next) {
  for (const mw of autocomplete) {
    await mw(req, res, next);
  }
}

describe("controller autocomplete", () => {
  let reqStub, resStub, nextStub;

  beforeEach(() => {
    reqStub = { query: { q: "search" } };
    resStub = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };
    nextStub = sinon.stub();
  })
  afterEach(sinon.restore);

  describe("validator", () => {
    it("should call next with error if validation fails", () => {
      reqStub.query = {};

      callAutocomplete(reqStub, resStub, nextStub);

      return expect(nextStub.getCall(0).args).to.have.lengthOf(1);
    })

    it("should fail if q param is missing", () => {
      reqStub.query = {};

      callAutocomplete(reqStub, resStub, nextStub);

      return expect(nextStub).to.have.been.called;
    })

    it("should fail if bias param is invalid", () => {
      reqStub.query = {
        q: "abc",
        bias: "invalid"
      };

      callAutocomplete(reqStub, resStub, nextStub);

      return expect(nextStub).to.have.been.called;
    })

    it("should fail if restrict param is invalid", () => {
      reqStub.query = {
        q: "abc",
        restrict: "invalid"
      };

      callAutocomplete(reqStub, resStub, nextStub);

      return expect(nextStub).to.have.been.called;
    })

    it("should call next without error if validation passes", () => {
      callAutocomplete(reqStub, resStub, nextStub);

      return expect(nextStub.getCall(0).args).to.have.lengthOf(0);
    })
  })

  describe("controller", () => {
    it("should have expected response if autocomplete is successful", async () => {
      await callAutocomplete(reqStub, resStub, nextStub);

      expect(resStub.status).to.have.been.calledOnceWith(200);
      expect(resStub.json.getCall(0).args[0]).to.have.jsonSchema(responseSchema);
      return;
    }).timeout(5000)

    it("should have expected response if no results are found", async () => {
      const id = axios.interceptors.request.use(req => {
        req.headers = {
          ...req.headers,
          "x-mock-response-id": "2741413-2837addf-92c5-40b3-9749-c0111ef8da76", // no results
        };

        return req;
      }, err => Promise.reject(err));

      await callAutocomplete(reqStub, resStub, nextStub);

      axios.interceptors.request.eject(id);

      expect(resStub.status).to.have.been.calledOnceWith(200);
      expect(resStub.json.getCall(0).args[0]).to.have.jsonSchema(responseSchema);
      expect(resStub.json.getCall(0).args[0].results).to.have.lengthOf(0);
      return;
    }).timeout(5000)
  });
})
