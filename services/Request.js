
export default class Request {
  constructor({
    query = {},
    params = {},
    body = {},
    headers = {}
  } = {}) {
    this.query = query;
    this.params = params;
    this.body = body;
    this.headers = headers;
  }
}
