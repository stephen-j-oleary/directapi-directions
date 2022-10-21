
import { expect } from "../chai.js";
import Stops from "../../services/Stops.js";
import Stop from "../../services/Stop.js";

describe("class Stops", () => {
  it("should handle object argument", () => {
    const props = { stops: [new Stop()] };

    const stops = new Stops(props);

    return expect(stops).to.be.an.instanceOf(Stops).that.has.property("stops");
  })

  it("should handle missing argument", () => {
    const stops = new Stops();

    return expect(stops).to.be.an.instanceOf(Stops);
  })

  it("should have expected default properties", () => {
    const expectedProps = {
      stops: { value: [], string: "", modifierString: "" },
      origin: undefined,
      destination: undefined,
      waypoints: { value: [], string: "", modifierString: "" }
    };

    const stops = new Stops();

    return expect(stops).to.deep.include(expectedProps);
  })

  it("should handle stops string", done => {
    const props = { stops: "address1|address2" };
    const expectedAddresses = ["address1", "address2"];

    const stops = new Stops(props);

    expect(stops.stops.value).to.be.an("array");
    stops.stops.value.forEach((stop, index) => expect(stop).to.be.an.instanceOf(Stop).that.has.property("address", expectedAddresses[index]));
    done();
  })

  it("should handle stops array of plain objects", done => {
    const props = { stops: [
      { address: "address1" },
      { address: "address2" }
    ] };
    const expectedAddresses = ["address1", "address2"];

    const stops = new Stops(props);

    expect(stops.stops.value).to.be.an("array");
    stops.stops.value.forEach((stop, index) => expect(stop).to.be.an.instanceOf(Stop).that.has.property("address", expectedAddresses[index]));
    done();
  })

  it("should handle stops array of Stop instances", done => {
    const props = { stops: [
      new Stop({ address: "address1" }),
      new Stop({ address: "address2" })
    ] };
    const expectedAddresses = ["address1", "address2"];

    const stops = new Stops(props);

    expect(stops.stops.value).to.be.an("array");
    stops.stops.value.forEach((stop, index) => expect(stop).to.be.an.instanceOf(Stop).that.has.property("address", expectedAddresses[index]));
    done();
  })

  it("should add an index modifier to each stop", done => {
    const props = { stops: "address1|address2" };
    const expectedIndexes = ["0", "1"];

    const stops = new Stops(props);

    stops.stops.value.forEach((stop, index) => expect(stop.modifiers).to.have.property("index", expectedIndexes[index]));
    done();
  })

  it("stops should have expected value when no stops are sent", done => {
    const stops = new Stops();

    expect(stops.stops.value).to.be.an("array").of.length(0);
    expect(stops.stops.string).to.be.a("string").that.equals("");
    expect(stops.stops.modifierString).to.be.a("string").that.equals("");
    done();
  })

  it("stops should have expected value when one stop is sent", done => {
    const stops = new Stops({ stops: "address" });

    expect(stops.stops.value).to.be.an("array").of.length(1);
    expect(stops.stops.string).to.be.a("string").that.equals("address");
    expect(stops.stops.modifierString).to.be.a("string").that.equals("index:0;address");
    done();
  })

  it("stops should have expected value when multiple stops are sent", done => {
    const stops = new Stops({ stops: "address1|address2" });

    expect(stops.stops.value).to.be.an("array").of.length(2);
    expect(stops.stops.string).to.be.a("string").that.equals("address1|address2");
    expect(stops.stops.modifierString).to.be.a("string").that.equals("index:0;address1|index:1;address2");
    done();
  })

  it("origin should have expected value when no stops are sent", () => {
    const stops = new Stops();

    return expect(stops.origin).to.be.undefined;
  })

  it("origin should have expected value when origin is sent", done => {
    const stops = new Stops({ stops: "type:origin;address" });

    expect(stops.origin.value).to.be.an("object").with.property("address", "address");
    expect(stops.origin.string).to.be.a("string").that.equals("address");
    expect(stops.origin.modifierString).to.be.a("string").that.equals("type:origin;index:0;address");
    done();
  })

  it("origin should have expected value when only destination is sent", done => {
    const stops = new Stops({ stops: "type:destination;address" });

    expect(stops.origin.value).to.be.an("object").with.property("address", "address");
    expect(stops.origin.string).to.be.a("string").that.equals("address");
    expect(stops.origin.modifierString).to.be.a("string").that.equals("type:destination;index:0;address");
    done();
  })

  it("origin should have expected value when no origin or destination is sent", done => {
    const stops = new Stops({ stops: "address" });

    expect(stops.origin.value).to.be.an("object").with.property("address", "address");
    expect(stops.origin.string).to.be.a("string").that.equals("address");
    expect(stops.origin.modifierString).to.be.a("string").that.equals("index:0;address");
    done();
  })

  it("destination should have expected value when no stops are sent", () => {
    const stops = new Stops();

    return expect(stops.destination).to.be.undefined;
  })

  it("destination should have expected value when destination is sent", done => {
    const stops = new Stops({ stops: "type:destination;address" });

    expect(stops.destination.value).to.be.an("object").with.property("address", "address");
    expect(stops.destination.string).to.be.a("string").that.equals("address");
    expect(stops.destination.modifierString).to.be.a("string").that.equals("type:destination;index:0;address");
    done();
  })

  it("destination should have expected value when only origin is sent", done => {
    const stops = new Stops({ stops: "type:origin;address" });

    expect(stops.destination.value).to.be.an("object").with.property("address", "address");
    expect(stops.destination.string).to.be.a("string").that.equals("address");
    expect(stops.destination.modifierString).to.be.a("string").that.equals("type:origin;index:0;address");
    done();
  })

  it("destination should have expected value when no origin or destination is sent", done => {
    const stops = new Stops({ stops: "address" });

    expect(stops.destination.value).to.be.an("object").with.property("address", "address");
    expect(stops.destination.string).to.be.a("string").that.equals("address");
    expect(stops.destination.modifierString).to.be.a("string").that.equals("index:0;address");
    done();
  })

  it("waypoints should have expected value when no stops are sent", done => {
    const stops = new Stops();

    expect(stops.waypoints.value).to.be.an("array").of.length(0);
    expect(stops.waypoints.string).to.be.a("string").that.equals("");
    expect(stops.waypoints.modifierString).to.be.a("string").that.equals("");
    done();
  })

  it("waypoints should have expected value when one stop is sent", done => {
    const stops = new Stops({ stops: "address" });

    expect(stops.waypoints.value).to.be.an("array").of.length(0);
    expect(stops.waypoints.string).to.be.a("string").that.equals("");
    expect(stops.waypoints.modifierString).to.be.a("string").that.equals("");
    done();
  })

  it("waypoints should have expected value when two stops are sent", done => {
    const stops = new Stops({ stops: "address1|address2" });

    expect(stops.waypoints.value).to.be.an("array").of.length(1);
    expect(stops.waypoints.string).to.be.a("string").that.equals("address2");
    expect(stops.waypoints.modifierString).to.be.a("string").that.equals("index:1;address2");
    done();
  })

  it("waypoints should have expected value when three or more stops are sent", done => {
    const stops = new Stops({ stops: "address1|address2|address3" });

    expect(stops.waypoints.value).to.be.an("array").of.length(2);
    expect(stops.waypoints.string).to.be.a("string").that.equals("optimize:true|address2|address3");
    expect(stops.waypoints.modifierString).to.be.a("string").that.equals("optimize:true|index:1;address2|index:2;address3");
    done();
  })

  it("waypoints should have not have stops that are specified as the origin or destination", done => {
    const stops = new Stops({ stops: "address1|type:origin;address2|address3|type:destination;address4" });

    expect(stops.waypoints.value).to.be.an("array").of.length(2);
    expect(stops.waypoints.string).to.be.a("string").that.equals("optimize:true|address1|address3");
    expect(stops.waypoints.modifierString).to.be.a("string").that.equals("optimize:true|index:0;address1|index:2;address3");
    done();
  })

  it("findByModifier should return undefined when modifier is not present", () => {
    const res = new Stops()
      .findByModifier("type");

    return expect(res).to.be.undefined;
  })

  it("findByModifier should return the stop when modifier is present", () => {
    const res = new Stops({ stops: "address1|type:origin;address2" })
      .findByModifier("type");

    return expect(res).to.be.an("object").with.property("address", "address2");
  })

  it("findByModifier should return undefined when modifier is present but value is not correct", () => {
    const res = new Stops({ stops: "address1|type:origin;address2" })
      .findByModifier("type", "destination");

    return expect(res).to.be.undefined;
  })

  it("findByModifier should return the stop when modifier is present and value is correct", () => {
    const res = new Stops({ stops: "address1|type:origin;address2" })
      .findByModifier("type", "origin");

      return expect(res).to.be.an("object").with.property("address", "address2");
  })

  it("hasModifier should return false when modifier is not present", () => {
    const res = new Stops()
      .hasModifier("type");

    return expect(res).to.be.false;
  })

  it("hasModifier should return true when modifier is present", () => {
    const res = new Stops({ stops: "address1|type:origin;address2" })
      .hasModifier("type");

    return expect(res).to.be.true;
  })

  it("hasModifier should return false when modifier is present but value is not correct", () => {
    const res = new Stops({ stops: "address1|type:origin;address2" })
      .hasModifier("type", "destination");

    return expect(res).to.be.false;
  })

  it("hasModifier should return true when modifier is present and value is correct", () => {
    const res = new Stops({ stops: "address1|type:origin;address2" })
      .hasModifier("type", "origin");

    return expect(res).to.be.true;
  })
})
