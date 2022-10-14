
import { expect } from "../../chai.js";
import DirectionsResponse, { interpretLegs, interpretStopOrder } from "../../../services/google/DirectionsResponse.js";
import Stops from "../../../services/Stops.js";
import Directions from "../../../services/google/Directions.js";

describe("module DirectionsResponse", () => {
  const dirMock = {};

  describe("function interpretLegs", () => {
    beforeEach(() => {
      dirMock.req = { params: {} };
    });

    it("should not modify input legs", () => {
      dirMock.req.params.stops = new Stops("type:origin;address1|address2|address3|address4")
      const legs = ["1to2", "2to3", "3to4", "4to1"];
      const expectedLegs = [...legs];
      interpretLegs(legs, dirMock);

      expect(legs).to.deep.equal(expectedLegs);
    })

    it("should handle requests with origin and destination specified", () => {
      dirMock.req.params.stops = new Stops("type:origin;address1|address2|address3|type:destination;address4");
      const legs = ["1to2", "2to3", "3to4"];
      const res = interpretLegs(legs, dirMock);

      expect(res).to.deep.equal(legs);
    })

    it("should handle requests with only origin specified", () => {
      dirMock.req.params.stops = new Stops("type:origin;address1|address2|address3|address4")
      const legs = ["1to2", "2to3", "3to4", "4to1"];
      const res = interpretLegs(legs, dirMock);

      expect(res).to.deep.equal(legs.slice(0, -1));
    })

    it("should handle requests with only destination specified", () => {
      dirMock.req.params.stops = new Stops("address1|address2|address3|type:destination;address4")
      const legs = ["4to1", "1to2", "2to3", "3to4"];
      const res = interpretLegs(legs, dirMock);

      expect(res).to.deep.equal(legs.slice(1));
    })

    it("should handle requests with no origin or destination specified", () => {
      dirMock.req.params.stops = new Stops("address1|address2|address3|address4")
      const legs = ["1to2", "2to3", "3to4", "4to1"];
      const res = interpretLegs(legs, dirMock);

      expect(res).to.deep.equal(legs.slice(0, -1));
    })
  })

  describe("function interpretStopOrder", () => {
    beforeEach(() => {
      dirMock.req = { params: {} }
    });

    it("should handle requests with origin and destination specified", () => {
      dirMock.req.params.stops = new Stops("type:origin;address1|address2|address3|type:destination;address4");
      const stopOrder = [0, 1];
      const expectedStopOrder = [0, 1, 2, 3];
      const res = interpretStopOrder(stopOrder, dirMock);

      return expect(res).to.deep.equal(expectedStopOrder);
    })

    it("should handle requests with only origin specified", () => {
      dirMock.req.params.stops = new Stops("type:origin;address1|address2|address3|address4");
      const stopOrder = [0, 1, 2];
      const expectedStopOrder = [0, 1, 2, 3];
      const res = interpretStopOrder(stopOrder, dirMock);

      return expect(res).to.deep.equal(expectedStopOrder);
    })

    it("should handle requests with only destination specified", () => {
      dirMock.req.params.stops = new Stops("address1|address2|address3|type:destination;address4");
      const stopOrder = [0, 1, 2];
      const expectedStopOrder = [0, 1, 2, 3];
      const res = interpretStopOrder(stopOrder, dirMock);

      return expect(res).to.deep.equal(expectedStopOrder);
    })

    it("should handle requests with no origin or destination specified", () => {
      dirMock.req.params.stops = new Stops("address1|address2|address3|address4");
      const stopOrder = [0, 1, 2];
      const expectedStopOrder = [0, 1, 2, 3];
      const res = interpretStopOrder(stopOrder, dirMock);

      return expect(res).to.deep.equal(expectedStopOrder);
    })

    it("should handle requests with reordered stops", () => {
      dirMock.req.params.stops = new Stops("address1|address2|address3|address4");
      const stopOrder = [2, 0, 1];
      const expectedStopOrder = [0, 3, 1, 2];
      const res = interpretStopOrder(stopOrder, dirMock);

      return expect(res).to.deep.equal(expectedStopOrder);
    })
  })

  describe("function createResponse", () => {
    beforeEach(() => {
      dirMock.req = {
        params: {
          stops: new Stops("type:origin;address|address0|address1|address2|type:destination;address")
        }
      }
      dirMock.data = {
        routes: [{
          waypoint_order: [2, 0, 1],
          legs: [
            {
              start: "origin",
              end: "addr2",
              steps: []
            },
            {
              start: "addr2",
              end: "addr0",
              steps: []
            },
            {
              start: "addr0",
              end: "addr1",
              steps: []
            },
            {
              start: "addr1",
              end: "destination",
              steps: []
            }
          ]
        }]
      };
    })

    it("should set response to a Directions object", () => {
      const res = DirectionsResponse.createResponse(dirMock);

      return expect(res).to.have.property("response").that.is.an.instanceOf(Directions);
    })
  })

  describe("function sendResponse", () => {
    let response;

    beforeEach(() => {
      response = new Directions({});
      dirMock.response = response;
    })

    it("should return the response property value", () => {
      const res = DirectionsResponse.sendResponse(dirMock);

      return expect(res).to.deep.equal(response);
    })
  })
})
