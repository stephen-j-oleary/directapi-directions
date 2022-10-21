
import _ from "lodash";

export default class Search {
  static Builder = class {
    setResults(val) {
      this.results = val;
      return this;
    }

    build() {
      return new Search(this);
    }
  }

  constructor({ results } = {}) {
    this.results = _.isArray(results) ? results : [];
  }
}
