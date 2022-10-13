
import flowAsync from "../../utils/flowAsync.js";
import DirectionsRequest from "./DirectionsRequest.js";
import DirectionsResponse from "./DirectionsResponse.js";

function createFlowObject(req = {}) {
  return { req };
}

/**
 * @param {Object<string, *>} options
 * @returns {Promise<*>}
 */
export default flowAsync(
  createFlowObject,
  DirectionsRequest.parseIncomingData,
  DirectionsRequest.createRequest,
  DirectionsRequest.sendRequest,
  DirectionsResponse.createResponse,
  DirectionsResponse.sendResponse
);
