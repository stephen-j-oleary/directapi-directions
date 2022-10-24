
import { expect } from "../../chai.js";
import Directions, { DirectionsRoute, DirectionsLeg, DirectionsStep } from "../../../services/directions/Directions.js";

describe("class DirectionsStep", () => {
  it("should handle object argument", () => {
    const props = {
      start: "value",
      end: "value"
    };

    const step = new DirectionsStep(props);

    return expect(step).to.be.an.instanceOf(DirectionsStep).that.deep.includes(props);
  })

  it("should handle missing argument", () => {
    const step = new DirectionsStep();

    return expect(step).to.be.an.instanceOf(DirectionsStep);
  })
})

describe("class DirectionsLeg", () => {
  it("should handle object argument", () => {
    const props = {
      start: "value",
      end: "value"
    };

    const leg = new DirectionsLeg(props);

    return expect(leg).to.be.an.instanceOf(DirectionsLeg).that.deep.includes(props);
  })

  it("should handle missing argument", () => {
    const leg = new DirectionsLeg();

    return expect(leg).to.be.an.instanceOf(DirectionsLeg);
  })

  it("should have expected default properties", () => {
    const expectedProps = { steps: [] };

    const leg = new DirectionsLeg();

    return expect(leg).to.deep.include(expectedProps);
  })

  describe("Builder", () => {
    let builder;

    beforeEach(() => {
      builder = new DirectionsLeg.Builder();
    })

    it("setStart should return the builder instance", () => {
      const res = builder.setStart("");

      return expect(res).to.deep.equal(builder);
    })

    it("setStart should set expected property", () => {
      const value = "value";

      builder.setStart(value);

      return expect(builder.start).to.equal(value);
    })

    it("setEnd should return the builder instance", () => {
      const res = builder.setEnd("");

      return expect(res).to.deep.equal(builder);
    })

    it("setEnd should set expected property", () => {
      const value = "value";

      builder.setEnd(value);

      return expect(builder.end).to.equal(value);
    })

    it("setSteps should return the builder instance", () => {
      const res = builder.setSteps([]);

      return expect(res).to.deep.equal(builder);
    })

    it("setSteps should set expected property", () => {
      const value = [1, 2, 3];

      builder.setSteps(value);

      return expect(builder.steps).to.deep.equal(value);
    })

    it("setDistance should return the builder instance", () => {
      const res = builder.setDistance(0);

      return expect(res).to.deep.equal(builder);
    })

    it("setDistance should set expected property", () => {
      const value = 0;

      builder.setDistance(value);

      return expect(builder.distance).to.equal(value);
    })

    it("setDuration should return the builder instance", () => {
      const res = builder.setDuration(0);

      return expect(res).to.deep.equal(builder);
    })

    it("setDuration should set expected property", () => {
      const value = 0;

      builder.setDuration(value);

      return expect(builder.duration).to.equal(value);
    })

    it("setTrafficDuration should return the builder instance", () => {
      const res = builder.setTrafficDuration(0);

      return expect(res).to.deep.equal(builder);
    })

    it("setTrafficDuration should set expected property", () => {
      const value = 0;

      builder.setTrafficDuration(value);

      return expect(builder.trafficDuration).to.equal(value);
    })

    it("build should return an instance of DirectionsLeg", () => {
      return expect(builder.build()).to.be.an.instanceOf(DirectionsLeg);
    })
  })
})

describe("class DirectionsRoute", () => {
  it("should handle object argument", () => {
    const props = {
      legs: [new DirectionsLeg(), new DirectionsLeg()],
      stopOrder: [1, 2]
    };

    const route = new DirectionsRoute(props);

    return expect(route).to.be.an.instanceOf(DirectionsRoute).that.deep.includes(props);
  })

  it("should handle missing argument", () => {
    const route = new DirectionsRoute();

    return expect(route).to.be.instanceOf(DirectionsRoute);
  })

  it("should have expected default properties", () => {
    const expectedProps = {
      legs: [],
      stopOrder: [],
      warnings: [],
      summary: ""
    };

    const route = new DirectionsRoute();

    return expect(route).to.deep.include(expectedProps);
  })

  it("should remove undefined legs", () => {
    const route = new DirectionsRoute({ legs: [undefined, 1, 2] });

    return expect(route.legs).to.have.lengthOf(2);
  })

  it("should remove undefined stopOrder", () => {
    const route = new DirectionsRoute({ stopOrder: [undefined, 1, 2] });

    return expect(route.stopOrder).to.have.lengthOf(2);
  })

  it("should remove undefined warnings", () => {
    const route = new DirectionsRoute({ warnings: [undefined, 1, 2] });

    return expect(route.warnings).to.have.lengthOf(2);
  })

  describe("Builder", () => {
    let builder;

    beforeEach(() => {
      builder = new DirectionsRoute.Builder();
    })

    it("setLegs should return the builder instance", () => {
      const res = builder.setLegs([]);

      return expect(res).to.deep.equal(builder);
    })

    it("setLegs should set expected property", () => {
      const value = [1, 2, 3];

      builder.setLegs(value);

      return expect(builder.legs).to.deep.equal(value);
    })

    it("setStopOrder should return the builder instance", () => {
      const res = builder.setStopOrder([]);

      return expect(res).to.deep.equal(builder);
    })

    it("setStopOrder should set expected property", () => {
      const value = [1, 2, 3];

      builder.setStopOrder(value);

      return expect(builder.stopOrder).to.deep.equal(value);
    })

    it("setFare should return the builder instance", () => {
      const res = builder.setFare({});

      return expect(res).to.deep.equal(builder);
    })

    it("setFare should set expected property", () => {
      const value = { key: "value" };

      builder.setFare(value);

      return expect(builder.fare).to.deep.equal(value);
    })

    it("setWarnings should return the builder instance", () => {
      const res = builder.setWarnings([]);

      return expect(res).to.deep.equal(builder);
    })

    it("setWarnings should set expected property", () => {
      const value = [1, 2, 3];

      builder.setWarnings(value);

      return expect(builder.warnings).to.deep.equal(value);
    })

    it("setCopyright should return the builder instance", () => {
      const res = builder.setCopyright("");

      return expect(res).to.deep.equal(builder);
    })

    it("setCopyright should replace expected property", () => {
      const value = "value";

      builder.setCopyright(value);

      return expect(builder.copyright).to.deep.equal(value);
    })

    it("setSummary should return the builder instance", () => {
      const res = builder.setSummary("");

      return expect(res).to.deep.equal(builder);
    })

    it("setSummary should replace expected property", () => {
      const value = "value";

      builder.setSummary(value);

      return expect(builder.summary).to.deep.equal(value);
    })

    it("build should return an instance of DirectionsRoute", () => {
      return expect(builder.build()).to.be.an.instanceOf(DirectionsRoute);
    })
  })
})

describe("class Directions", () => {
  it("should handle object argument", () => {
    const props = {
      routes: [new DirectionsRoute(), new DirectionsRoute()]
    };

    const directions = new Directions(props);

    return expect(directions).to.be.an.instanceOf(Directions).that.deep.includes(props);
  })

  it("should handle missing argument", () => {
    const directions = new Directions();

    return expect(directions).to.be.an.instanceOf(Directions);
  })

  it("should have expected default properties", () => {
    const expectedProps = { routes: [] };

    const directions = new Directions();

    return expect(directions).to.deep.include(expectedProps);
  })

  describe("Builder", () => {
    let builder;

    beforeEach(() => {
      builder = new Directions.Builder();
    })

    it("setRoutes should return the builder instance", () => {
      const res = builder.setRoutes([]);

      return expect(res).to.deep.equal(builder);
    })

    it("setRoutes should set expected property", () => {
      const value = [1, 2, 3];

      builder.setRoutes(value);

      return expect(builder.routes).to.deep.equal(value);
    })

    it("build should return an instance of Directions", () => {
      return expect(builder.build()).to.be.an.instanceOf(Directions);
    })
  })
})
