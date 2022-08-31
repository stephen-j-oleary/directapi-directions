const chai = require("./chai.js"),
      sinon = require("sinon"),
      expect = chai.expect,
      axios = require("axios");
require("dotenv").config();

const Google = require("../Google");

describe("class Google", () => {
  const path = "directions/json",
        params = new URLSearchParams({ query: "value" });
  afterEach(() => {
    sinon.restore();
  });

  describe("static method sendRequest", () => {
    let requestStub;
    beforeEach(() => {
      requestStub = sinon.stub(axios, "get").resolves({ data: "Sample data" });
    });


    it("should reject if invalid argument is sent", () => {
      return expect(Google.sendRequest()).to.be.rejectedWith(TypeError, "Invalid argument");
    });

    it("should reject if HTTP request fails", () => {
      requestStub.rejects(new Error("Error"));
      return expect(Google.sendRequest(path, { params })).to.be.rejectedWith(Error, "Error");
    });

    it("should resolve with data obtained from the HTTP request", () => {
      return expect(Google.sendRequest(path, { params })).to.become("Sample data");
    });

    it("should send a GET request to the Google Api Once", async () => {
      await Google.sendRequest(path, { params });
      return Promise.all([
        expect(requestStub).to.have.been.calledOnce,
        expect(requestStub.getCall(0).args[0]).to.satisfy(str => str.startsWith(process.env.GOOGLE_API_URL))
      ]);
    });
  });
});