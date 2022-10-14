
import Directions, { DirectionsRoute } from "./Directions.js";

export function interpretLegs(legs = [], dirPipe) {
  const stops = dirPipe.req.params.stops;

  const res = [...legs]; // Copy array to avoid modifying argument array
  if (!stops.hasModifier("type", "origin") && stops.hasModifier("type", "destination")) res.shift(); // Exclude first leg if "specified" destination was used as origin
  if (!stops.hasModifier("type", "destination")) res.pop(); // Exclude last leg if destination was not "specified"

  return res;
}

export function interpretStopOrder(stopOrder = [], dirPipe) {
  const stops = dirPipe.req.params.stops;
  const { originIndex, destinationIndex, waypointsIndexes } = stops;

  return [
    ...(stops.hasModifier("type", "origin") || !stops.hasModifier("type", "destination")) ? [originIndex] : [], // Exclude if "specified" destination was used as origin
    ...stopOrder.map(i => waypointsIndexes[i]), // Map waypoint order to original waypoint indexes
    ...(stops.hasModifier("type", "destination")) ? [destinationIndex] : [] // Include only if destination was "specified"
  ];
}

export function createResponse(dirPipe) {
  const response = new Directions.Builder()
    .setRoutes(dirPipe.data.routes.map(item => (
      new DirectionsRoute.Builder()
        .setSummary(item.summary)
        .setFare(item.fare)
        .setWarnings(item.warnings)
        .setCopyright(item.copyrights)
        .setStopOrder(interpretStopOrder(item.waypoint_order, dirPipe))
        .buildLegs(interpretLegs(item.legs, dirPipe))
        .build()
    )))
    .build();

  return { ...dirPipe, response };
}

export function sendResponse(dirPipe) {
  return dirPipe.response;
}

export default {
  createResponse,
  sendResponse
}
