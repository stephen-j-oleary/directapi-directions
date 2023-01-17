
import _ from "lodash";

const DEFAULT_LIMIT = 20;

export default class Autocomplete {
  static Builder = class {
    setLimit(val) {
      this.limit = val;
      return this;
    }

    setResults(val) {
      this.results = val;
      return this;
    }

    build() {
      return new Autocomplete(this);
    }
  }

  constructor({ results, limit = DEFAULT_LIMIT } = {}) {
    this.results = _.isArray(results)
      ? results.slice(0, limit)
      : [];
  }
}
