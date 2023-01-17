
import _ from "lodash";

export default class Request {
  static create(props = {}) {
    return new Request(props);
  }

  constructor(props = {}) {
    const ALLOWED_PROPS = ["query", "params", "body", "headers"];
    Object.assign(this, _.pick(props, ALLOWED_PROPS));
  }
}
