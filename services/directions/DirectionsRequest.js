
import Request from "../Request.js";

export default class DirectionsRequest extends Request {
  static create(props) {
    return new DirectionsRequest(props);
  }

  constructor(props) {
    super(props);

    const { query } = this;

    this.stops = query.stops;
  }
}
