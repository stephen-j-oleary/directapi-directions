
import { expect } from "../../chai.js";
import axios from "axios";
import AxiosMock from "axios-mock-adapter";
import Stops from "../../../services/Stops.js";
import DirectionsRequest from "../../../services/google/DirectionsRequest.js";
import _ from "lodash";

describe("module DirectionsRequest", () => {
  const dirMock = {};
  const stopsStr5 = "type:origin;address|address0|address1|address2|type:destination;address";

  describe("function parseIncomingData", () => {
    beforeEach(() => {
      dirMock.req = {
        method: "GET",
        query: { stops: stopsStr5 }
      }
    })

    it("should not modify req object", () => {
      const expected = _.cloneDeep(dirMock.req);

      DirectionsRequest.parseIncomingData(dirMock);

      return expect(dirMock.req).to.deep.equal(expected);
    })

    it("should handle GET requests", () => {
      dirMock.req.method = "GET";

      return expect(() => DirectionsRequest.parseIncomingData(dirMock)).to.not.throw();
    })

    it("should handle POST requests", () => {
      dirMock.req.method = "POST";

      return expect(() => DirectionsRequest.parseIncomingData(dirMock)).to.not.throw();
    })

    it("should reject if an unsupported http method is used", () => {
      dirMock.req.method = "PUT";

      return expect(() => DirectionsRequest.parseIncomingData(dirMock)).to.throw();
    })

    it("should return an object containing expected req property", () => {
      const expected = {
        params: { stops: new Stops(stopsStr5) }
      };

      expect(DirectionsRequest.parseIncomingData(dirMock).req).to.deep.include(expected);
    })
  })

  describe("function createRequest", () => {
    beforeEach(() => {
      dirMock.req = {
        params: { stops: new Stops(stopsStr5) }
      }
    })

    it("should throw if invalid stops are sent", () => {
      dirMock.req.params.stops = ["stop1"];

      return expect(DirectionsRequest.createRequest(dirMock)).to.be.rejectedWith(Error);
    })

    it("should return an object containing expected config property", async () => {
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

      const res = await DirectionsRequest.createRequest(dirMock);

      return expect(res).to.have.property("config").that.has.jsonSchema(expectedFormat);
    })
  })

  describe("function sendRequest", () => {
    const data = { obj: "ect" };
    let axiosMock;

    beforeEach(() => {
      dirMock.config = {
        baseURL: "base",
        url: "url",
        method: "get",
        params: {}
      };
      axiosMock = new AxiosMock(axios);
      axiosMock.onGet().reply(200, data);
    })

    it("should throw if axios request fails", () => {
      axiosMock.onGet().reply(400, "Invalid request");

      return expect(DirectionsRequest.sendRequest(dirMock)).to.be.rejectedWith(Error);
    })

    it("should send the request to axios", async () => {
      await DirectionsRequest.sendRequest(dirMock);

      return expect(axiosMock.history.get[0]).to.deep.contain(dirMock.config);
    })

    it("should return an object containing the expected data property", async () => {
      const res = await DirectionsRequest.sendRequest(dirMock);

      return expect(res).to.have.property("data").that.deep.equals(data);
    })
  })
})
