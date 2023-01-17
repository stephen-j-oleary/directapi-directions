
import axios from "axios";
import _ from "lodash";
import flowAsync from "../../utils/flowAsync.js";
import ApiError from "../../utils/ApiError.js";
import Autocomplete from "./Autocomplete.js";
import Location from "../Location.js";
import Request from "../Request.js";

const METHOD = "get";
const URL = "place/autocomplete/json";

class GoogleRequest {
  static Builder = class {
    setQ(val) {
      this.input = val;
      return this;
    }

    setRadius(val) {
      this.radius = val;
      return this;
    }

    setLocation(val) {
      this.location = val;
      return this;
    }

    build() {
      return new GoogleRequest(this);
    }
  }

  constructor(props = {}) {
    const ALLOWED_PROPS = ["input", "radius", "components", "language", "location", "locationbias", "locationrestriction", "offset", "origin", "region", "sessiontoken", "strictbounds", "types"];
    const DEFAULT_PROPS = {
      key: process.env.GOOGLE_API_KEY,
      radius: 50_000,
      types: "address"
    };

    this.baseURL = process.env.GOOGLE_API_URL;
    this.url = URL;
    this.method = METHOD;
    this.params = _.defaults({}, _.pick(props, ALLOWED_PROPS), DEFAULT_PROPS);
  }
}

async function buildRequest(request) {
  const { query } = request;

  const config = new GoogleRequest.Builder()
    .setQ(query.q)
    .setRadius(query.radius)
    .setLocation(query.location)
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

function buildAutocompleteResponse(request) {
  const response = new Autocomplete.Builder()
    .setLimit(request.query.limit)
    .setResults(request.data.predictions.map(item => {
      const _item = _(item);

      return new Location.Builder()
        .setId(_item.get("place_id"))
        .setDistance(_item.get("distance_meters"))
        .setText({
          full: _item.get("description"),
          main: _item.get("structured_formatting.main_text"),
          secondary: _item.get("structured_formatting.secondary_text")
        })
        .setMatch({
          full: _item.get("matched_substrings.0"),
          main: _item.get("structured_formatting.main_text_matched_substrings.0"),
          secondary: _item.get("structured_formatting.secondary_text_matched_substrings.0")
        })
        .build()
    }))
    .build();

  return response;
}

export default flowAsync(
  Request.create,
  buildRequest,
  sendRequest,
  buildAutocompleteResponse
)
