
import { expect } from "../../chai.js";
import sinon from "sinon";
import axios from "axios";
import search from "../../../controllers/search.js";
import responseSchema from "../../../schemas/search/response.js";

describe("controller search", () => {
  let reqStub, resStub, nextStub;

  beforeEach(() => {
    reqStub = { query: { q: "search", bias: "circle:1000:52.1,105.2" } };
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

      search.validator(reqStub, resStub, nextStub);

      return expect(nextStub.getCall(0).args).to.have.lengthOf(1);
    })

    it("should fail if q param is missing", () => {
      reqStub.query = {};

      search.validator(reqStub, resStub, nextStub);

      return expect(nextStub).to.have.been.called;
    })

    it("should fail if bias param is invalid", () => {
      reqStub.query = {
        q: "abc",
        bias: "invalid"
      };

      search.validator(reqStub, resStub, nextStub);

      return expect(nextStub).to.have.been.called;
    })

    it("should fail if restrict param is invalid", () => {
      reqStub.query = {
        q: "abc",
        restrict: "invalid"
      };

      search.validator(reqStub, resStub, nextStub);

      return expect(nextStub).to.have.been.called;
    })

    it("should call next without error if validation passes", () => {
      search.validator(reqStub, resStub, nextStub);

      return expect(nextStub.getCall(0).args).to.have.lengthOf(0);
    })
  })

  describe("controller", () => {
    it("should have expected response if search is successful", async () => {
      await search.controller(reqStub, resStub, nextStub);

      expect(resStub.status).to.have.been.calledOnceWith(200);
      expect(resStub.json.getCall(0).args[0]).to.have.jsonSchema(responseSchema);
      return;
    }).timeout(5000)

    it("should have expected response if no results are found", async () => {
      const id = axios.interceptors.request.use(req => {
        req.headers = {
          ...req.headers,
          "x-mock-response-id": "2741413-3a3bbb1d-f1ab-4992-a983-57a40bfb9c60", // place/textsearch/json no results
        };

        return req;
      }, err => Promise.reject(err));

      await search.controller(reqStub, resStub, nextStub);

      axios.interceptors.request.eject(id);

      expect(resStub.status).to.have.been.calledOnceWith(200);
      expect(resStub.json.getCall(0).args[0]).to.have.jsonSchema(responseSchema);
      expect(resStub.json.getCall(0).args[0].results).to.have.lengthOf(0);
      return;
    }).timeout(5000)
  });
})
