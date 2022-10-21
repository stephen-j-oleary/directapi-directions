
import Request from "../Request.js";
import Bounds from "../Bounds.js";

export default class SearchRequest extends Request {
  static create(props) {
    return new SearchRequest(props);
  }

  constructor(props) {
    super(props);

    const { bounds, ...query } = this.query;

    this.q = query.q;
    this.center = query.center;
    this.radius = query.radius;
    this.bounds = (bounds instanceof Bounds) ? bounds : new Bounds(bounds);
    this.near = query.near;
    this.limit = query.limit;
  }
}
