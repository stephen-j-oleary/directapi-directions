const Directions = require("../../Directions.js");

const chai = require("../chai.js"),
      expect = chai.expect,
      sinon = require("sinon"),
      app = require("../../app");
require("dotenv").config();

describe("route directions", () => {
  const PROXY_SECRET = process.env.RAPIDAPI_PROXY_SECRET;
  const PATH = "/directions";
  let server, directionsSendRequestStub;

  before(() => {
    server = chai.request(app).keepOpen();
  });

  after(() => {
    server.close();
  });

  beforeEach(() => {
    directionsSendRequestStub = sinon.stub(Directions, "sendRequest").resolves({
      status: "OK",
      routes: [{
        copyrights: "Copyright",
        warnings: [],
        waypoint_order: [0],
        legs: [
          { distance: 1000, duration: 150, start: "Address 1", end: "Address 2" },
        ]
      }]
    });
  });

  afterEach(() => {
    sinon.restore();
  });


  describe("get", () => {
    it("should respond with 400 if required parameters are not sent", async () => {
      const response = await server
        .get(PATH)
        .set("X-RapidAPI-Proxy-Secret", PROXY_SECRET);

      return Promise.all([
        expect(response).to.have.status(400),
        expect(response).to.be.json,
        expect(response.body).to.have.property("message").and.to.be.a("string")
      ]);
    });

    it("should respond with 400 if too few stops are sent", async () => {
      const response = await server
        .get(PATH)
        .set("X-RapidAPI-Proxy-Secret", PROXY_SECRET)
        .query({ stops: "Address 1" });

      return Promise.all([
        expect(response).to.have.status(400),
        expect(response).to.be.json,
        expect(response.body).to.have.property("message").and.to.be.a("string")
      ]);
    });

    it("should respond with 500 if google maps could not be reached", async () => {
      directionsSendRequestStub.rejects(new Error("message"));

      const response = await server
        .get(PATH)
        .set("X-RapidAPI-Proxy-Secret", PROXY_SECRET)
        .query({ stops: "Address 1|Address 2" });

      return Promise.all([
        expect(response).to.have.status(500),
        expect(response).to.be.json,
        expect(response.body).to.have.property("message").and.to.be.a("string")
      ]);
    });

    it("should respond with 200 if user was successfully created", async () => {
      const response = await server
        .get(PATH)
        .set("X-RapidAPI-Proxy-Secret", PROXY_SECRET)
        .query({ stops: "Address 1|Address 2" });

      return Promise.all([
        expect(response).to.have.status(200),
        expect(response).to.be.json,
        expect(response.body).to.have.property("stopOrder").and.to.be.an("array"),
        expect(response.body).to.have.property("legs").and.to.be.an("array")
      ]);
    });
  });
});