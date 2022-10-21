
import axios from "axios";
import _ from "lodash";
import flowAsync from "../../utils/flowAsync.js";
import ApiError from "../../utils/ApiError.js";
import SearchRequest from "./SearchRequest.js";
import Search from "./Search.js";
import Location from "../Location.js";

const BASE_URL = process.env.FOURSQUARE_API_URL;
const METHOD = "get";
const URL = "search";
const HEADERS = {
  "Authorization": process.env.FORSQUARE_API_KEY
};
const DEFAULT_LIMIT = 10;

class FoursquareRequest {
  static Builder = class {
    setQ(val) {
      this.query = val;
      return this;
    }

    setCircle(center, radius) {
      this.ll = center;
      this.radius = radius;
      return this;
    }

    setLimit(val) {
      this.limit = val;
      return this;
    }

    build() {
      return new FoursquareRequest(this);
    }
  }

  constructor(props = {}) {
    const _props = _(props);

    this.baseURL = BASE_URL;
    this.url = URL;
    this.method = METHOD;
    this.headers = HEADERS;
    this.params = {
      q: _props.get("q"),
      ll: _props.get("ll"),
      radius: _props.get("radius"),
      limit: _props.get("limit", DEFAULT_LIMIT)
    };
  }
}

async function buildRequest(request) {
  const config = new FoursquareRequest.Builder()
    .setQ(request.q)
    .setCircle(request.center, request.radius)
    .setLimit(request.limit)
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

function buildSearchResponse(request) {
  const response = new Search.Builder()
    .setResults(request.data.map(item => {
      const _item = _(item);

      return new Location.Builder()
        .setId(_item.get("fsq_id"))
        .setCoordinates(_item.get("geocodes.main.latitude"), _item.get("geocodes.main.longitude"))
        .setAddress({
          formatted_address: _item.get("location.formatted_address"),
          number: _item.get("location.address"),
          street: _item.get("location.address"),
          city: _item.get("location.locality"),
          state: _item.get("location.region"),
          country: _item.get("location.country"),
          postal_code: _item.get("location.postcode")
        })
        .build()
    }))
    .build();

  return response;
}

export default flowAsync(
  SearchRequest.create,
  buildRequest,
  sendRequest,
  buildSearchResponse
)
