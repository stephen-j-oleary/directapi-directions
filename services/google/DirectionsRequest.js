
import Stops from "../Stops.js";
import axios from "axios";
import _ from "lodash";
import ApiError from "../../utils/ApiError.js";

const BASE_URL = process.env.GOOGLE_API_URL;
const KEY = process.env.GOOGLE_API_KEY;
const METHOD = "get";
const URL = "directions/json";
const MINIMUM_STOPS = 2;
const DEFAULT_PARAMS = {
  key: KEY,
  alternatives: "false",
  mode: "driving",
  traffic_model: "best_guess",
  units: "metric",
  departure_time: "now"
};

function parseGetData(req) {
  return _.chain(req)
    .cloneDeep()
    .updateWith("query.stops", value => new Stops(value))
    .mapKeys((_, key) => (key === "query") ? "params" : key)
    .value();
}

function parsePostData(req) {
  return _.chain(req)
    .cloneDeep()
    .update("body.stops", value => new Stops(value))
    .mapKeys((_, key) => (key === "body") ? "params" : key)
    .value();
}

export function parseIncomingData(dirPipe) {
  const { req } = dirPipe;
  const { method } = req;

  const newReq = (method === "GET")
    ? parseGetData(req)
    : (method === "POST")
    ? parsePostData(req)
    : undefined;

  if (!newReq) throw new ApiError(400, "invalid_request", "Unsupported http request method");

  return { ...dirPipe, req: newReq };
}

export async function createRequest(dirPipe) {
  const {
    stops,
    arrivalTime,
    avoidHighways,
    departureTime,
    searchRegion,
    trafficModel,
    units
  } = dirPipe.req.params;
  if (stops.length < MINIMUM_STOPS) throw new ApiError(400, "Too few stops", "invalid_request", { message: `Please ensure a minimum of ${MINIMUM_STOPS} stops` });

  const params = {
    origin: stops.originAddress,
    destination: stops.destinationAddress,
    arrival_time: arrivalTime,
    avoid: avoidHighways && "highways",
    departure_time: departureTime,
    region: searchRegion,
    traffic_model: trafficModel,
    units: units,
    waypoints: (stops.waypoints.length > 0)
      ? [
        ...(stops.waypoints.length > 1) ? ["optimize:true"] : [],
        ...stops.waypointsAddresses
      ].join("|")
      : undefined
  }

  const config = {
    baseURL: BASE_URL,
    url: URL,
    method: METHOD,
    params: _.omitBy(_.assignWith(
      {},
      DEFAULT_PARAMS,
      params,
      (obj, src) => _.isUndefined(obj) ? src : obj
    ), _.isUndefined)
  };

  return { ...dirPipe, config };
}

export async function sendRequest(dirPipe) {
  try {
    const res = await axios.request(dirPipe.config);
    const data = res.data;

    return { ...dirPipe, data };
  }
  catch (err) {
    throw new ApiError(500, "Error sending request", "server_error", err.response?.data || err.request || err.message);
  }
}

export default {
  parseIncomingData,
  createRequest,
  sendRequest
}
