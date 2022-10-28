
import _ from "lodash";
import getWith from "../../utils/getWith.js";

export class DirectionsStep {
  constructor(props = {}) {
    this.start = _.get(props, "start");
    this.end = _.get(props, "end");
    this.instructions = _.get(props, "instructions");
    this.polyline = _.get(props, "polyline");
    this.distance = _.get(props, "distance");
    this.duration = _.get(props, "duration");
    this.maneuver = _.get(props, "maneuver");
    this.steps = _.map(
      getWith(props, "steps", _.isArray, []),
      item => (item instanceof DirectionsStep) ? item : new DirectionsStep(item)
    );
  }
}

export class DirectionsLeg {
  static Builder = class {
    setStart(val) {
      this.start = val;
      return this;
    }

    setEnd(val) {
      this.end = val;
      return this;
    }

    setSteps(val) {
      this.steps = val;
      return this;
    }

    setDistance(val) {
      this.distance = val;
      return this;
    }

    setDuration(val) {
      this.duration = val;
      return this;
    }

    setTrafficDuration(val) {
      this.trafficDuration = val;
      return this;
    }

    build() {
      return new DirectionsLeg(this);
    }
  }

  constructor(props = {}) {
    this.start = _.get(props, "start");
    this.end = _.get(props, "end");
    this.steps = _.map(
      getWith(props, "steps", _.isArray, []),
      item => (item instanceof DirectionsStep) ? item : new DirectionsStep(item)
    );
    this.distance = _.get(props, "distance");
    this.duration = _.get(props, "duration");
    this.trafficDuration = _.get(props, "trafficDuration");
  }
}

export class DirectionsRoute {
  static Builder = class {
    setBounds(val) {
      this.bounds = val;
      return this;
    }

    setCopyright(val) {
      this.copyright = val;
      return this;
    }

    setLegs(val) {
      this.legs = val;
      return this;
    }

    setPolyline(val) {
      this.polyline = val;
      return this;
    }

    setStopOrder(val) {
      this.stopOrder = val;
      return this;
    }

    setSummary(val) {
      this.summary = val;
      return this;
    }

    setWarnings(val) {
      this.warnings = val;
      return this;
    }

    setFare(val) {
      this.fare = val;
      return this;
    }

    build() {
      return new DirectionsRoute(this);
    }
  }

  constructor(props = {}) {
    this.bounds = _.get(props, "bounds");
    this.copyright = _.get(props, "copyright");
    this.legs = _.map(
      _.reject(getWith(props, "legs", _.isArray, []), _.isUndefined),
      item => (item instanceof DirectionsLeg) ? item : new DirectionsLeg(item)
    );
    this.polyline = _.get(props, "polyline");
    this.stopOrder = _.reject(getWith(props, "stopOrder", _.isArray, []), _.isUndefined);
    this.summary = getWith(props, "summary", _.isString, "");
    this.warnings = _.reject(getWith(props, "warnings", _.isArray, []), _.isUndefined);
    this.fare = _.get(props, "fare");
  }
}

export default class Directions {
  static Builder = class {
    setRoutes(val) {
      this.routes = val;
      return this;
    }

    build() {
      return new Directions(this);
    }
  }

  constructor(props = {}) {
    this.routes = _.map(
      getWith(props, "routes", _.isArray, []),
      item => (item instanceof DirectionsRoute) ? item : new DirectionsRoute(item)
    );
  }
}
