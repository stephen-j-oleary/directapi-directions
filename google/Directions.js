
export class DirectionsStep {
  constructor(builder = {}) {
    const { start, end, maneuver, distance, duration, summary } = builder;

    this.start = start;
    this.end = end;
    this.maneuver = maneuver;
    this.distance = distance;
    this.duration = duration;
    this.summary = summary;
  }
}

export class DirectionsLeg {
  static Builder = class {
    steps = [];

    setStart(val) {
      this.start = val;
      return this;
    }

    setEnd(val) {
      this.end = val;
      return this;
    }

    buildSteps(arr) {
      this.steps = arr.map(item => new DirectionsStep({
        start: item.start_location,
        end: item.end_location,
        maneuver: item.maneuver,
        distance: item.distance?.value,
        duration: item.duration?.value,
        summary: item.html_instructions
      }));
      return this;
    }

    setDistance(num) {
      this.distance = num;
      return this;
    }

    setDuration(num) {
      this.duration = num;
      return this;
    }

    setTrafficDuration(num) {
      this.trafficDuration = num;
      return this;
    }

    build() {
      return new DirectionsLeg(this);
    }
  }

  constructor(builder = {}) {
    const { start, end, steps, distance, duration, trafficDuration } = builder;

    this.start = start;
    this.end = end;
    this.steps = steps;
    this.distance = distance;
    this.duration = duration;
    this.trafficDuration = trafficDuration;
  }
}

export class DirectionsRoute {
  static Builder = class {
    legs = [];
    stopOrder = [];
    fare = {};
    warnings = [];

    buildLegs(arr) {
      this.legs = arr.map(item => new DirectionsLeg.Builder()
        .setStart(item.start_address)
        .setEnd(item.end_address)
        .setDistance(item.distance?.value)
        .setDuration(item.duration?.value)
        .setTrafficDuration(item.duration_in_traffic?.value)
        .buildSteps(item.steps)
        .build());
      return this;
    }

    setStopOrder(arr) {
      this.stopOrder = arr;
      return this;
    }

    setFare(fare) {
      this.fare = fare;
      return this;
    }

    setWarnings(arr) {
      this.warnings = arr;
      return this;
    }

    setCopyright(str) {
      this.copyright = str;
      return this;
    }

    setSummary(str) {
      this.summary = str;
      return this;
    }

    build() {
      return new DirectionsRoute(this);
    }
  }

  constructor(builder = {}) {
    const { legs, stopOrder, fare, warnings, copyright, summary } = builder;

    this.legs = legs;
    this.stopOrder = stopOrder;
    this.fare = fare;
    this.warnings = warnings;
    this.copyright = copyright;
    this.summary = summary;
  }
}

export default class Directions {
  static Builder = class {
    routes = [];

    setRoutes(arr) {
      this.routes = arr;
      return this;
    }

    buildRoutes(arr) {
      this.routes = arr.map(item => new DirectionsRoute.Builder()
        .setSummary(item.summary)
        .setFare(item.fare)
        .setStopOrder(item.waypoint_order)
        .setWarnings(item.warnings)
        .setCopyright(item.copyrights)
        .buildLegs(item.legs)
        .build());
      return this;
    }

    build() {
      return new Directions(this);
    }
  }

  constructor(builder = {}) {
    const { routes } = builder;

    this.routes = routes;
  }
}
