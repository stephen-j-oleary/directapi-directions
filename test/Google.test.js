const chai = require("./chai.js"),
      sinon = require("sinon"),
      expect = chai.expect,
      axios = require("axios");
require("dotenv").config();

const { Google, GoogleSearch, GoogleDirections } = require("../Google");

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

describe("class GoogleSearch", () => {
  let google;
  beforeEach(() => {
    google = new GoogleSearch();
  });
  afterEach(() => {
    sinon.restore();
  });
  describe("method constructor", () => {
    it("should create a new instance of the GoogleSearch class", () => {
      return expect(google).to.be.an("object").and.to.be.instanceOf(GoogleSearch);
    });
  });
  describe("method autocomplete", () => {
    let getEndpointStub, formatAutocompleteStub;
    beforeEach(() => {
      getEndpointStub = sinon.stub(google, "getEndpoint").resolves({ status: "OK", predictions: [{
        place_id: "SampleId",
        description: "2836 Heritage Drive, Calgary, AB",
        structured_formatting: {
          main_text: "2836 Heritage Drive",
          secondary_text: "Calgary, AB"
        }
      }] });
      formatAutocompleteStub = sinon.stub(GoogleSearch, "formatResponse").returns({
        placeId: "SampleId",
        description: "2836 Heritage Drive, Calgary, AB",
        address: "2836 Heritage Drive, Calgary, AB",
        mainText: "2836 Heritage Drive",
        secondaryText: "Calgary, AB"
      });
    });
    it("should reject if required arguments are not sent", () => {
      return expect(google.autocomplete()).to.be.rejectedWith(TypeError, "Invalid Argument");
    });
    it("should reject if call to getEndpoint method fails", () => {
      getEndpointStub.rejects(new Error("Error"));
      return expect(google.autocomplete("Calgary")).to.be.rejectedWith(Error, "Error");
    });
    it("should resolve with result of call to formatResponse method", () => {
      return expect(google.autocomplete("Calgary")).to.become({
        placeId: "SampleId",
        description: "2836 Heritage Drive, Calgary, AB",
        address: "2836 Heritage Drive, Calgary, AB",
        mainText: "2836 Heritage Drive",
        secondaryText: "Calgary, AB"
      });
    });
    it("should call getEndpoint method once", async () => {
      await google.autocomplete("Calgary");
      return expect(getEndpointStub).to.have.been.calledOnce;
    });
    it("should call formatResponse method once", async () => {
      await google.autocomplete("Calgary");
      return expect(formatAutocompleteStub).to.have.been.calledOnce;
    });
  });
  describe("method formatResponse", () => {
    it("should throw if invalid argument is sent", () => {
      return expect(() => GoogleSearch.formatResponse("string")).to.throw(TypeError, "Invalid Argument");
    })
    it("should return empty array if no argument is sent", () => {
      return expect(GoogleSearch.formatResponse()).to.be.an("array").and.to.deep.equal([]);
    });
    it("should remove items without a place_id and description", () => {
      let response = GoogleSearch.formatResponse([ {
        place_id: "Value", description: "Value"
      }, {
        structured_formatting: {
          main_text: "Value",
          secondary_text: "Value"
        }
      } ]);
      return expect(response.length).to.eql(1);
    });
    it("should return an array of objects of the expected format", () => {
      let response = GoogleSearch.formatResponse([ {
        place_id: "SampleId",
        description: "2836 Heritage Drive, Calgary, AB"
      }, {
        place_id: "SampleId",
        description: "2295 7th Ave, Calgary, AB",
        structured_formatting: {
          main_text: "2295 7th Ave",
          secondary_text: "Calgary, AB"
        }
      }]);
      return Promise.all([
        expect(response[0]).to.have.property("placeId"),
        expect(response[0]).to.have.property("description"),
        expect(response[0]).to.have.property("mainText"),
        expect(response[0]).to.have.property("secondaryText")
      ]);
    });
  });
});