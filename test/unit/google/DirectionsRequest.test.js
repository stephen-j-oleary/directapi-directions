
import { expect } from "../../chai.js";
import axios from "axios";
import AxiosMock from "axios-mock-adapter";
import Stops from "../../../services/Stops.js";
import { buildDirectionsRequest, sendDirectionsRequest } from "../../../services/google/DirectionsRequest.js";

describe("module DirectionsRequest", () => {
  let dirMock;

  describe("function buildDirectionsRequest", () => {
    beforeEach(() => {
      dirMock = {
        rawRequest: {
          stops: new Stops("origin:address|address0|address1|address2|destination:address")
        }
      }
    })

    it("should throw if invalid stops are sent", () => {
      dirMock.rawRequest.stops = ["stop1"];

      return expect(buildDirectionsRequest(dirMock)).to.be.rejectedWith(Error);
    })

    it("should set request to an object", async () => {
      const res = await buildDirectionsRequest(dirMock);

      return expect(res).to.have.property("request").that.is.an("object");
    })

    it("should set request to the expected format", async () => {
      const expectedFormat = {
        "type": "object",
        "required": ["baseURL", "url", "method", "params"],
        "properties": {
          "baseURL": "string",
          "url": "string",
          "method": "string",
          "params": {
            "type": "object",
            "required": ["key", "alternatives", "mode", "traffic_model", "units", "origin", "destination", "departure_time"],
            "properties": {
              "key": "string",
              "origin": "string",
              "destination": "string",
              "alternatives": "string",
              "mode": "string",
              "traffic_model": "string",
              "units": "string",
              "departure_time": "string",
              "arrival_time": "string",
              "avoid": "string",
              "region": "string",
              "waypoints": ["string", "undefined"]
            }
          }
        }
      };

      const res = await buildDirectionsRequest(dirMock);

      return expect(res.request).to.have.jsonSchema(expectedFormat);
    })
  })

  describe("function sendDirectionsRequest", () => {
    const rawResponse = { obj: "ect" };
    let axiosMock;

    beforeEach(() => {
      dirMock = {
        request: {
          baseURL: "base",
          url: "url",
          method: "get",
          params: {}
        }
      };
      axiosMock = new AxiosMock(axios);
      axiosMock.onGet().reply(200, rawResponse);
    })

    it("should throw if axios request fails", () => {
      axiosMock.onGet().reply(400, "Invalid request");

      return expect(sendDirectionsRequest(dirMock)).to.be.rejectedWith(Error);
    })

    it("should send the request to axios", async () => {
      await sendDirectionsRequest(dirMock);

      return expect(axiosMock.history.get[0]).to.deep.contain(dirMock.request);
    })

    it("should set rawResponse to expected value", async () => {
      const res = await sendDirectionsRequest(dirMock);

      return expect(res).to.have.property("rawResponse").that.deep.equals(rawResponse);
    })
  })
})
