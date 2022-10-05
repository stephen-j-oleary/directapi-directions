
import flowAsync from "../helpers/flowAsync.js";
import { buildDirectionsRequest, sendDirectionsRequest } from "./DirectionsRequest.js";
import { buildDirectionsResponse, sendDirectionsResponse } from "./DirectionsResponse.js";

function createFlowObject(options = {}) {
  return { rawRequest: options };
}

/**
 * @param {Object<string, *>} options
 * @returns {Promise<*>}
 */
export default flowAsync(
  createFlowObject,
  buildDirectionsRequest,
  sendDirectionsRequest,
  buildDirectionsResponse,
  sendDirectionsResponse
);
