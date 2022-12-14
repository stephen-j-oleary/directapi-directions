
import axios from "axios";
import _ from "lodash";
import flowAsync from "../../utils/flowAsync.js";
import ApiError from "../../utils/ApiError.js";
import SearchRequest from "./SearchRequest.js";
import Search from "./Search.js";
import Location from "../Location.js";

const METHOD = "get";
const URL = "place/textsearch/json";

class GoogleRequest {
  static Builder = class {
    setQ(val) {
      this.query = val;
      return this;
    }

    setLocation(val) {
      this.location = val;
      return this;
    }

    setRadius(val) {
      this.radius = val;
      return this;
    }

    build() {
      return new GoogleRequest(this);
    }
  }

  constructor(props = {}) {
    const ALLOWED_PROPS = ["query", "location", "radius"];
    const DEFAULT_PROPS = {
      key: process.env.GOOGLE_API_KEY
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
    .setLocation(query.location)
    .setRadius(query.radius)
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

function findAddressComponent(_item, type) {
  return _item.get("address_components")?.find(item => item.types.includes(type))?.get("long_name");
}

function buildSearchResponse(request) {
  const response = new Search.Builder()
    .setLimit(request.query.limit)
    .setResults(request.data.results.map(item => {
      const _item = _(item);

      return new Location.Builder()
        .setId(_item.get("place_id"))
        .setCoordinates(Number(_item.get("geometry.location.lat")), Number(_item.get("geometry.location.lng")))
        .setAddress({
          formatted_address: _item.get("formatted_address"),
          number: findAddressComponent(_item, "street_number"),
          street: findAddressComponent(_item, "route"),
          city: findAddressComponent(_item, "sublocality"),
          state: findAddressComponent(_item, "administrative_area_level_1"),
          country: findAddressComponent(_item, "country"),
          postal_code: findAddressComponent(_item, "postal_code")
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
