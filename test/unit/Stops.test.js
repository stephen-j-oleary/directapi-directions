
import { expect } from "../chai.js";
import Stops from "../../services/Stops.js";
import Stop from "../../services/Stop.js";

describe("class Stops", () => {
  it("should have expected properties", () => {
    const stops = new Stops([
      new Stop(),
      new Stop()
    ]);

    return expect(stops).to.have.property("stops").that.is.an("array");
  })

  it("should have expected default properties", () => {
    const expectedDefaultStops = [];

    const stops = new Stops();

    return expect(stops.stops).to.deep.equal(expectedDefaultStops);
  })

  it("should handle string initializer", done => {
    const string = "origin:address1|address2";

    const stops = new Stops(string);

    expect(stops.stops).to.have.lengthOf(2);
    stops.stops.forEach(s => expect(s).to.be.instanceOf(Stop));
    done();
  });

  describe("get origin", () => {
    const originStop = new Stop("type:origin;address");
    const destinationStop = new Stop("type:destination;address");

    it("should have the expected properties", done => {
      const stops = new Stops([new Stop("addr1"), originStop, new Stop("addr2")]);

      expect(stops.origin).to.have.property("index").that.is.a("number");
      expect(stops.origin).to.have.property("value").that.is.an("object");
      done();
    })

    it("should be a stop with origin modifier", () => {
      const stops = new Stops([new Stop("addr1"), originStop, new Stop("addr2")]);

      return expect(stops.origin.value).to.deep.equal(originStop);
    })

    it("should return a stop with destination modifier if no origin modifier exists", () => {
      const stops = new Stops([new Stop("addr1"), destinationStop, new Stop("addr2")]);

      return expect(stops.origin.value).to.deep.equal(destinationStop);
    })

    it("should return the first stop if no origin or destination modifier exists", () => {
      const firstStop = new Stop("firstStop");
      const stops = new Stops([firstStop, new Stop("addr1"), new Stop("addr2")]);

      return expect(stops.origin.value).to.deep.equal(firstStop);
    })
  })

  describe("get waypoints", () => {
    const originStop = new Stop("type:origin;address");
    const destinationStop = new Stop("type:destination;address");

    it("should remove any stops with origin or destination modifiers", () => {
      const stops = new Stops([new Stop("addr1"), originStop, new Stop("addr2"), destinationStop]);

      return expect(stops.waypoints).to.have.lengthOf(2);
    })

    it("should remove first stop if no origin or destination modifiers exist", () => {
      const stops = new Stops([new Stop("addr1"), new Stop("addr2"), new Stop("addr3")]);

      return expect(stops.waypoints).to.have.lengthOf(2);
    })
  })

  describe("get destination", () => {
    const originStop = new Stop("type:origin;address");
    const destinationStop = new Stop("type:destination;address");

    it("should have the expected properties", done => {
      const stops = new Stops([new Stop("addr1"), destinationStop, new Stop("addr2")]);

      expect(stops.destination).to.have.property("index").that.is.a("number");
      expect(stops.destination).to.have.property("value").that.is.an("object");
      done();
    })

    it("should return a stop with destination modifier", () => {
      const stops = new Stops([new Stop("addr1"), destinationStop, new Stop("addr2")]);

      return expect(stops.destination.value).to.deep.equal(destinationStop);
    })

    it("should return a stop with origin modifier if no destination modifier exists", () => {
      const stops = new Stops([new Stop("addr1"), originStop, new Stop("addr2")]);

      return expect(stops.destination.value).to.deep.equal(originStop);
    })

    it("should return the first stop if no origin or destination modifier exists", () => {
      const firstStop = new Stop("firstStop");
      const stops = new Stops([firstStop, new Stop("addr1"), new Stop("addr2")]);

      return expect(stops.destination.value).to.deep.equal(firstStop);
    })
  })

  describe("method hasModifier", () => {
    const originStop = new Stop("type:origin;address");

    it("should return true if modifier is present", () => {
      const stops = new Stops([new Stop("addr1"), originStop, new Stop("addr2")]);

      return expect(stops.hasModifier("type", "origin")).to.be.true;
    })

    it("should return false if modifier isnt present", () => {
      const stops = new Stops([new Stop("addr1"), new Stop("addr2"), new Stop("addr3")]);

      return expect(stops.hasModifier("type", "origin")).to.be.false;
    })
  })
})
