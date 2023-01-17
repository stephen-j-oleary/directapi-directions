
import { expect } from "../../chai.js";
import Autocomplete from "../../../services/autocomplete/Autocomplete.js";

describe("class Autocomplete", () => {
  it("should handle object argument", () => {
    const props = { results: [] };

    const autocomplete = new Autocomplete(props);

    return expect(autocomplete).to.be.an.instanceOf(Autocomplete).that.deep.includes(props);
  })

  it("should handle missing argument", () => {
    const autocomplete = new Autocomplete();

    return expect(autocomplete).to.be.an.instanceOf(Autocomplete);
  })

  it("should have expected default properties", () => {
    const expectedProps = { results: [] };

    const autocomplete = new Autocomplete();

    return expect(autocomplete).to.deep.include(expectedProps);
  })

  it("should handle limit prop", () => {
    const expectedProps = { results: [1, 2] };

    const autocomplete = new Autocomplete({ results: [1, 2, 3], limit: 2 });

    return expect(autocomplete).to.deep.include(expectedProps);
  })

  describe("Builder", () => {
    it("setLimit should return the builder instance", () => {
      const builder = new Autocomplete.Builder();

      const res = builder.setLimit(5);

      return expect(res).to.deep.equal(builder);
    })

    it("setLimit should set expected properties", () => {
      const limit = 5;

      const builder = new Autocomplete.Builder()
        .setLimit(limit);

      return expect(builder.limit).to.equal(limit);
    })

    it("setResults should return the builder instance", () => {
      const builder = new Autocomplete.Builder();

      const res = builder.setResults([]);

      return expect(res).to.deep.equal(builder);
    })

    it("setResults should set expected properties", () => {
      const results = [1, 2, 3];

      const builder = new Autocomplete.Builder()
        .setResults(results);

      return expect(builder.results).to.include.all.members(results);
    })

    it("build should return an instance of Autocomplete", () => {
      const res = new Autocomplete.Builder()
        .build();

      return expect(res).to.be.an.instanceOf(Autocomplete);
    })
  })
})
