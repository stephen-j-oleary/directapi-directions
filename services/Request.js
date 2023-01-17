
import _ from "lodash";

export default class Request {
  constructor(props = {}) {
    const ALLOWED_PROPS = ["query", "params", "body", "headers"];
    Object.assign(this, _.pick(props, ALLOWED_PROPS));
  }
}
