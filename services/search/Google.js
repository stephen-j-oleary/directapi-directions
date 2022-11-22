
import axios from "axios";
import _ from "lodash";
import flowAsync from "../../utils/flowAsync.js";
import ApiError from "../../utils/ApiError.js";
import SearchRequest from "./SearchRequest.js";
import Search from "./Search.js";
import Location from "../Location.js";

const METHOD = "get";
const URL = "place/textsearch/json";
const DEFAULT_LIMIT = 10;

class GoogleRequest {
  static Builder = class {
    setQ(val) {
      this.query = val;
      return this;
    }

    setBias(val = "") {
      const [biasType, ...args] = val.split(":");
      switch (biasType) {
        case "circle":
          // args[0]: Radius in meters
          // args[1]: Center as "lat,lng"
          this.locationbias = `circle:${args[0]}@${args[1]}`;
          break;
        case "rect":
          // args[0]: Bounds as "south,west,north,east"
          const [south, west, north, east] = args[0].split(",");
          this.locationbias = `rectangle:${south},${west}|${north},${east}`;
          break;
      }
      return this;
    }

    setRestrict(val = "") {
      const [biasType, ...args] = val.split(":");
      switch (biasType) {
        case "circle":
          // args[0]: Radius in meters
          // args[1]: Center as "lat,lng"
          this.locationrestriction = `circle:${args[0]}@${args[1]}`;
          break;
        case "rect":
          // args[0]: Bounds as "south,west,north,east"
          const [south, west, north, east] = args[0].split(",");
          this.locationrestriction = `rectangle:${south},${west}|${north},${east}`;
          break;
        case "country":
          // args[0]: ISO 3166-1 Alpha-2 country code
          this.components = `country:${args[0]}`;
          break;
      }
      return this;
    }

    setLimit(val) {
      this.limit = val;
      return this;
    }

    setLocation(val) {
      this.origin = val;
      return this;
    }

    build() {
      return new GoogleRequest(this);
    }
  }

  constructor(props = {}) {
    const ALLOWED_PROPS = ["query", "locationbias", "locationrestriction", "components", "limit", "origin"];
    const DEFAULT_PROPS = {
      key: process.env.GOOGLE_API_KEY,
      limit: DEFAULT_LIMIT
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
    .setBias(query.bias)
    .setRestrict(query.restrict)
    .setLimit(query.limit)
    .setLocation(query.location)
    .build();

  return { ...request, config };
}

async function sendRequest(request) {
  console.log(request.config);
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
