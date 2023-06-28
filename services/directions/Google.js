
import axios from "axios";
import _ from "lodash";
import flowAsync from "../../utils/flowAsync.js";
import ApiError from "../../utils/ApiError.js";
import DirectionsRequest from "./DirectionsRequest.js";
import Directions, { DirectionsLeg, DirectionsRoute, DirectionsStep } from "./Directions.js";
import Stops from "../Stops.js";

const METHOD = "get";
const URL = "directions/json";

class GoogleRequest {
  static Builder = class {
    setStops(val) {
      this.stops = val;
      return this;
    }

    setArrivalTime(val) {
      this.arrival_time = val;
      return this;
    }

    setDepartureTime(val) {
      this.departure_time = val;
      return this;
    }

    setAvoid(val) {
      this.avoid = val;
      return this;
    }

    setRegion(val) {
      this.region = val;
      return this;
    }

    setTrafficModel(val) {
      this.traffic_model = val;
      return this;
    }

    setUnits(val) {
      this.units = val;
      return this;
    }

    setLimit(val) {
      this.limit = val;
      return this;
    }

    build() {
      return new GoogleRequest(this);
    }
  }

  constructor({ stops, ...props } = {}) {
    const ALLOWED_PROPS = ["arrival_time", "departure_time", "avoid", "region", "traffic_model", "units", "limit"];
    const DEFAULT_PROPS = {
      key: process.env.GOOGLE_API_KEY,
      alternatives: "true",
      mode: "driving",
      departure_time: "now",
      traffic_model: "best_guess",
      units: "metric",
      limit: 1
    };
    const { origin, destination, waypoints } = (stops instanceof Stops) ? stops : new Stops({ stops });

    this.baseURL = process.env.GOOGLE_API_URL;
    this.url = URL;
    this.method = METHOD;
    this.params = _.defaults(
      {
        origin: origin?.string,
        destination: destination?.string,
        waypoints: waypoints?.string
      },
      _.pick(props, ALLOWED_PROPS),
      DEFAULT_PROPS
    );
  }
}

async function buildRequest(request) {
  const { query } = request;

  const config = new GoogleRequest.Builder()
    .setStops(decodeURIComponent(query.stops))
    .setArrivalTime(query.arrival_time)
    .setDepartureTime(query.departure_time)
    .setAvoid(query.avoid_highways && "highways")
    .setRegion(query.region)
    .setTrafficModel(query.traffic_model)
    .setUnits(query.units)
    .setLimit(query.limit)
    .build();

  return { ...request, config };
}

async function sendRequest(request) {
  try {
    const res = await axios.request(request.config);
    return { ...request, data: res.data };
  }
  catch (err) {
    throw new ApiError(500, "Error sending request", "server_error", err.response?.data || err.response || err.message);
  }
}

function interpretStep(step) {
  return new DirectionsStep({
    start: step.start_location,
    end: step.end_location,
    instructions: step.html_instructions,
    polyline: step.polyline?.points,
    distance: step.distance,
    duration: step.duration,
    maneuver: step.maneuver,
    steps: step.steps ? interpretStep(step.steps) : undefined
  });
}

function interpretBounds(bounds) {
  if (!bounds) return undefined;

  return {
    ne: bounds.northeast,
    sw: bounds.southwest
  };
};

function interpretLegs(legs = [], stops) {
  const hasOrigin = stops.hasModifier("type", "origin");
  const hasDestination = stops.hasModifier("type", "destination");

  return _.chain(legs)
    .clone()
    .tap(val => (!hasOrigin && hasDestination) && val.shift()) // Exclude first leg if "specified" destination was used as origin
    .tap(val => (!hasDestination) && val.pop()) // Exclude last leg if destination was not "specified"
    .value();
}

function interpretStopOrder(stopOrder = [], stops) {
  const hasOrigin = stops.hasModifier("type", "origin");
  const hasDestination = stops.hasModifier("type", "destination");
  const { origin, destination, waypoints } = stops;

  return [
    ...(hasOrigin || !hasDestination) ? [+origin?.value?.getModifier("index")] : [], // Exclude if "specified" destination was used as origin
    ...stopOrder.map(i => +waypoints?.value?.[i]?.getModifier("index")), // Map waypoint order to original waypoint indexes
    ...(hasDestination) ? [+destination?.value?.getModifier("index")] : [] // Include only if destination was "specified"
  ];
}

function buildDirectionsResponse(request) {
  const stops = new Stops({ stops: request.query.stops });

  const response = new Directions.Builder()
    .setRoutes(request.data.routes.map(item => (
      new DirectionsRoute.Builder()
        .setBounds(interpretBounds(item.bounds))
        .setCopyright(item.copyrights)
        .setLegs(interpretLegs(item.legs, stops).map(leg => (
          new DirectionsLeg.Builder()
            .setStart({
              address: {
                formattedAddress: leg.start_address
              },
              lat: leg.start_location.lat,
              lng: leg.start_location.lng
            })
            .setEnd({
              address: {
                formattedAddress: leg.end_address
              },
              lat: leg.end_location.lat,
              lng: leg.end_location.lng
            })
            .setSteps(leg.steps.map(interpretStep))
            .setDistance(leg.distance)
            .setDuration(leg.duration)
            .setTrafficDuration(leg.duration_in_traffic)
            .build()
        )))
        .setPolyline(item.overview_polyline?.points)
        .setStopOrder(interpretStopOrder(item.waypoint_order, stops))
        .setSummary(item.summary)
        .setWarnings(item.warnings)
        .setFare(item.fare)
        .build()
    )))
    .build();

  return response;
}

export default flowAsync(
  DirectionsRequest.create,
  buildRequest,
  sendRequest,
  buildDirectionsResponse
)
