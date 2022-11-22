
import { expect } from "../../chai.js";
import Search from "../../../services/search/Search.js";

describe("class Search", () => {
  it("should handle object argument", () => {
    const props = { results: [] };

    const search = new Search(props);

    return expect(search).to.be.an.instanceOf(Search).that.deep.includes(props);
  })

  it("should handle missing argument", () => {
    const search = new Search();

    return expect(search).to.be.an.instanceOf(Search);
  })

  it("should have expected default properties", () => {
    const expectedProps = { results: [] };

    const search = new Search();

    return expect(search).to.deep.include(expectedProps);
  })

  it("should handle limit prop", () => {
    const expectedProps = { results: [1, 2] };

    const search = new Search({ results: [1, 2, 3], limit: 2 });

    return expect(search).to.deep.include(expectedProps);
  })

  describe("Builder", () => {
    it("setLimit should return the builder instance", () => {
      const builder = new Search.Builder();

      const res = builder.setLimit(5);

      return expect(res).to.deep.equal(builder);
    })

    it("setLimit should set expected properties", () => {
      const limit = 5;

      const builder = new Search.Builder()
        .setLimit(limit);

      return expect(builder.limit).to.equal(limit);
    })

    it("setResults should return the builder instance", () => {
      const builder = new Search.Builder();

      const res = builder.setResults([]);

      return expect(res).to.deep.equal(builder);
    })

    it("setResults should set expected properties", () => {
      const results = [1, 2, 3];

      const builder = new Search.Builder()
        .setResults(results);

      return expect(builder.results).to.include.all.members(results);
    })

    it("build should return an instance of Search", () => {
      const res = new Search.Builder()
        .build();

      return expect(res).to.be.an.instanceOf(Search);
    })
  })
})
