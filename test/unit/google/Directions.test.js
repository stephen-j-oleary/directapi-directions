
import { expect } from "../../chai.js";
import Directions, { DirectionsRoute, DirectionsLeg, DirectionsStep } from "../../../services/google/Directions.js";

describe("class DirectionsStep", () => {
  let step;
  const props = {
    start: "start",
    end: "end",
    maneuver: "maneuver",
    distance: 1200,
    duration: 80,
    summary: "summary"
  };

  beforeEach(() => {
    step = new DirectionsStep(props);
  })

  it("should handle missing argument", () => {
    step = new DirectionsStep();

    return expect(step).to.be.instanceOf(DirectionsStep);
  })

  it("should have expected properties", done => {
    for (const [key, value] of Object.entries(props)) {
      expect(step).to.have.property(key).that.equals(value);
    }
    done();
  })
})

describe("class DirectionsLeg", () => {
  let leg;
  const props = {
    start: "start",
    end: "end",
    steps: ["step", "step"],
    distance: 2400,
    duration: 240,
    trafficDuration: 320
  };

  beforeEach(() => {
    leg = new DirectionsLeg(props);
  })

  it("should handle missing argument", () => {
    leg = new DirectionsLeg();

    return expect(leg).to.be.instanceOf(DirectionsLeg);
  })

  it("should have expected properties", done => {
    for (const [key, value] of Object.entries(props)) {
      expect(leg).to.have.property(key).that.equals(value);
    }
    done();
  })
})

describe("class DirectionsLegBuilder", () => {
  let builder;

  beforeEach(() => {
    builder = new DirectionsLeg.Builder();
  })

  it("should have expected properties", () => {
    return expect(builder).to.have.property("steps").that.is.an("array");
  })

  it("should have expected default values", () => {
    return expect(builder.steps).to.deep.equal([]);
  })

  it("should have expected methods", done => {
    const expectedMethods = [
      "setStart",
      "setEnd",
      "buildSteps",
      "setDistance",
      "setDuration",
      "setTrafficDuration",
      "build"
    ];

    for (const method of expectedMethods) {
      expect(builder).to.have.property(method).that.is.a("function");
    }
    done();
  })

  it("setStart should replace expected property", () => {
    const value = "str";

    builder.setStart(value);

    return expect(builder.start).to.deep.equal(value);
  })

  it("setEnd should replace expected property", () => {
    const value = "str";

    builder.setEnd(value);

    return expect(builder.end).to.deep.equal(value);
  })

  it("buildSteps should replace expected property", () => {
    const value = [1, 2, 3];

    builder.buildSteps(value);

    return expect(builder.steps).to.be.an("array").of.length(value.length);
  })

  it("buildSteps should create an array of DirectionsSteps", done => {
    const value = [1, 2, 3];

    builder.buildSteps(value);

    builder.steps.forEach(item => expect(item).to.be.instanceOf(DirectionsStep));
    done();
  })

  it("setDistance should replace expected property", () => {
    const value = 1000;

    builder.setDistance(value);

    return expect(builder.distance).to.deep.equal(value);
  })

  it("setDuration should replace expected property", () => {
    const value = 120;

    builder.setDuration(value);

    return expect(builder.duration).to.deep.equal(value);
  })

  it("setTrafficDuration should replace expected property", () => {
    const value = 180;

    builder.setTrafficDuration(value);

    return expect(builder.trafficDuration).to.deep.equal(value);
  })

  it("build should create an instance of DirectionsLeg", () => {
    return expect(builder.build()).to.be.an.instanceOf(DirectionsLeg);
  })
})

describe("class DirectionsRoute", () => {
  let route;
  const props = {
    legs: ["leg", "leg"],
    stopOrder: [0, 1],
    fare: {},
    warnings: ["warning"],
    copyright: "copyright",
    summary: "summary"
  };

  beforeEach(() => {
    route = new DirectionsRoute(props);
  })

  it("should handle missing argument", () => {
    route = new DirectionsRoute();

    return expect(route).to.be.instanceOf(DirectionsRoute);
  })

  it("should have expected static properties", () => {
    return expect(DirectionsRoute).to.have.property("Builder").that.is.a("function");
  })

  it("should have expected properties", done => {
    for (const [key, value] of Object.entries(props)) {
      expect(route).to.have.property(key).that.equals(value);
    }
    done();
  })
})

describe("class DirectionsRouteBuilder", () => {
  let builder;

  beforeEach(() => {
    builder = new DirectionsRoute.Builder();
  })

  it("should have expected properties", done => {
    expect(builder).to.have.property("legs").that.is.an("array");
    expect(builder).to.have.property("stopOrder").that.is.an("array");
    expect(builder).to.have.property("fare").that.is.an("object");
    expect(builder).to.have.property("warnings").that.is.an("array");
    done();
  })

  it("should have expected default values", done => {
    expect(builder.legs).to.deep.equal([]);
    expect(builder.stopOrder).to.deep.equal([]);
    expect(builder.fare).to.deep.equal({});
    expect(builder.warnings).to.deep.equal([]);
    done();
  })

  it("should have expected methods", done => {
    const expectedMethods = [
      "buildLegs",
      "setStopOrder",
      "setFare",
      "setWarnings",
      "setCopyright",
      "setSummary",
      "build"
    ];

    for (const method of expectedMethods) {
      expect(builder).to.have.property(method).that.is.a("function");
    }
    done();
  })

  it("buildLegs should replace expected property", () => {
    const value = [1, 2, 3];

    builder.buildLegs(value);

    return expect(builder.legs).to.be.an("array").of.length(value.length);
  })

  it("buildLegs should create an array of DirectionsLegs", done => {
    const value = [1, 2, 3];

    builder.buildLegs(value);

    builder.legs.forEach(item => expect(item).to.be.instanceOf(DirectionsLeg));
    done();
  })

  it("setStopOrder should replace expected property", () => {
    const value = [1, 2, 3];

    builder.setStopOrder(value);

    return expect(builder.stopOrder).to.deep.equal(value);
  })

  it("setFare should replace expected property", () => {
    const value = { fare: "obj" };

    builder.setFare(value);

    return expect(builder.fare).to.deep.equal(value);
  })

  it("setWarnings should replace expected property", () => {
    const value = [1, 2, 3];

    builder.setWarnings(value);

    return expect(builder.warnings).to.deep.equal(value);
  })

  it("setCopyright should replace expected property", () => {
    const value = "str";

    builder.setCopyright(value);

    return expect(builder.copyright).to.deep.equal(value);
  })

  it("setSummary should replace expected property", () => {
    const value = "str";

    builder.setSummary(value);

    return expect(builder.summary).to.deep.equal(value);
  })

  it("build should create an instance of DirectionsRoute", () => {
    return expect(builder.build()).to.be.an.instanceOf(DirectionsRoute);
  })
})

describe("class Directions", () => {
  let directions;

  beforeEach(() => {
    directions = new Directions({
      routes: [1, 2, 3]
    });
  })

  it("should handle missing argument", () => {
    directions = new Directions();

    return expect(directions).to.be.instanceOf(Directions);
  })

  it("should have expected static properties", () => {
    return expect(Directions).to.have.property("Builder").that.is.a("function");
  })

  it("should have expected properties", () => {
    return expect(directions).to.have.property("routes").that.is.an("array");
  })

  it("should have expected default properties", () => {
    directions = new Directions();

    return expect(directions.routes).to.deep.equal([]);
  })

  it("should replace invalid properties with default values", () => {
    directions = new Directions({ routes: "invalid" });

    return expect(directions.routes).to.deep.equal([]);
  })
})

describe("class DirectionsBuilder", () => {
  let builder;

  beforeEach(() => {
    builder = new Directions.Builder();
  })

  it("should have expected properties", () => {
    return expect(builder).to.have.property("routes").that.is.an("array");
  })

  it("should have expected default values", () => {
    return expect(builder.routes).to.deep.equal([]);
  })

  it("should have expected methods", done => {
    const expectedMethods = [
      "setRoutes",
      "build"
    ];

    for (const method of expectedMethods) {
      expect(builder).to.have.property(method).that.is.a("function");
    }
    done();
  })

  it("setRoutes should replace expected property", () => {
    const value = [1, 2, 3];

    builder.setRoutes(value);

    return expect(builder.routes).to.deep.equal(value);
  })

  it("build should create an instance of Directions", () => {
    return expect(builder.build()).to.be.an.instanceOf(Directions);
  })
})
