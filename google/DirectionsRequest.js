
import Stops from "../Stops.js";
import axios from "axios";
import _ from "lodash";
import ApiError from "../ApiError.js";

const BASE_URL = process.env.GOOGLE_API_URL;
const KEY = process.env.GOOGLE_API_KEY;
const METHOD = "get";
const URL = "directions/json";
const MINIMUM_STOPS = 2;
const DEFAULT_PARAMS = {
  key: KEY,
  alternatives: false,
  mode: "driving",
  traffic_model: "best_guess",
  units: "metric"
};

export async function buildDirectionsRequest(dirPipe) {
  const { stops, arrivalTime, avoidHighways, departureTime, searchRegion, trafficModel, units } = dirPipe.rawRequest;
  if (!(stops instanceof Stops)) throw new ApiError(400, "Invalid stops parameter", "invalid_request");
  if (stops.length < MINIMUM_STOPS) throw new ApiError(400, "Too few stops", "invalid_request");

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

  const request = {
    baseUrl: BASE_URL,
    url: URL,
    method: METHOD,
    params: _.assignWith(
      {},
      DEFAULT_PARAMS,
      params,
      (obj, src) => _.isUndefined(obj) ? src : obj
    )
  };

  return { ...dirPipe, request };
}

export async function sendDirectionsRequest(dirPipe) {
  try {
    console.log(dirPipe.request);
    const res = await axios.request(dirPipe.request);
    const rawResponse = res.data;

    return { ...dirPipe, rawResponse };
  } catch (err) {
    throw new ApiError(500, `Error sending request: ${err.message}`, "server_error");
  }
}

export default {
  buildRequest: buildDirectionsRequest,
  sendRequest: sendDirectionsRequest
}
