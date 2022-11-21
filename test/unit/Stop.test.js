
import { expect } from "../chai.js";
import Stop from "../../services/Stop.js";

describe("class Stop", () => {
  it("should handle object argument", () => {
    const props = { address: "value" };

    const stop = new Stop(props);

    return expect(stop).to.be.an.instanceOf(Stop).that.deep.includes(props);
  })

  it("should handle missing argument", () => {
    const stop = new Stop();

    return expect(stop).to.be.an.instanceOf(Stop);
  })

  it("should handle invalid address prop", () => {
    const expectedVal = "";

    const stop = new Stop({ address: [] });

    return expect(stop.address).to.equal(expectedVal);
  })

  it("should handle modifier with only key", () => {
    const expectedVal = [["key"]];

    const stop = new Stop({ modifiers: "key" });

    return expect(stop.modifiers).to.deep.equal(expectedVal);
  })

  it("should handle invalid modifiers prop", () => {
    const expectedVal = [];

    const stop = new Stop({ modifiers: false });

    return expect(stop.modifiers).to.deep.equal(expectedVal);
  })

  it("should handle combining modifiers from address string and modifiers prop", () => {
    const expectedModifiers = [["a", "0"], ["b", "1"], ["b", "2"], ["c", "3"]];
    const props = {
      address: "a:0;b:1;address",
      modifiers: [["b", "2"], ["c", "3"]]
    };

    const stop = new Stop(props);

    return expect(stop.modifiers).to.deep.have.members(expectedModifiers);
  })

  it("should have expected default properties", () => {
    const expectedProps = {
      address: "",
      modifiers: []
    };

    const stop = new Stop();

    return expect(stop).to.deep.include(expectedProps);
  })

  it("toString should handle stop with no modifiers", () => {
    const expectedStr = "address";

    const str = new Stop({ address: "address" })
      .toString();

    return expect(str).to.equal(expectedStr);
  })

  it("toString should handle stop one modifier", () => {
    const expectedStr = "address";

    const str = new Stop({ address: "address", modifiers: { a: "1" } })
      .toString();

    return expect(str).to.equal(expectedStr);
  })

  it("toString should handle stop with multiple modifiers", () => {
    const expectedStr = "address";

    const str = new Stop({ address: "address", modifiers: { a: "1", b: "2" } })
      .toString();

    return expect(str).to.equal(expectedStr);
  })

  it("toModifierString should handle stop with no modifiers", () => {
    const expectedStr = "address";

    const str = new Stop({ address: "address" })
      .toModifierString();

    return expect(str).to.equal(expectedStr);
  })

  it("toModifierString should handle stop one modifier", () => {
    const expectedStr = "a:1;address";

    const str = new Stop({ address: "address", modifiers: [["a", "1"]] })
      .toModifierString();

    return expect(str).to.equal(expectedStr);
  })

  it("toModifierString should handle stop with multiple modifiers", done => {
    const expectedAddress = "address";
    const expectedModifiers = ["a:1", "b:2"];

    const str = new Stop({ address: "address", modifiers: [["a", "1"], ["b", "2"]] })
      .toModifierString();

    expect(str).to.satisfy(val => val.endsWith(expectedAddress));
    expectedModifiers.forEach(val => expect(str).to.include(val));
    done();
  })

  it("setModifier should set expected value", () => {
    const [key, value] = ["a", "1"];
    const stop = new Stop();

    stop.setModifier(key, value);

    return expect(stop.modifiers).to.be.an("array").that.deep.includes([key, value]);
  })

  it("hasModifier should return true when modifier is present", () => {
    const stop = new Stop({ modifiers: [["a", "1"]] });

    return expect(stop.hasModifier("a")).to.be.true;
  })

  it("hasModifier should return true when modifier is present and value is correct", () => {
    const stop = new Stop({ modifiers: [["a", "1"]] });

    return expect(stop.hasModifier("a", "1")).to.be.true;
  })

  it("hasModifier should return false when modifier is not present", () => {
    const stop = new Stop();

    return expect(stop.hasModifier("a")).to.be.false;
  })

  it("hasModifier should return false when modifier is present but value is not correct", () => {
    const stop = new Stop({ modifiers: { a: "1" } });

    return expect(stop.hasModifier("a", "2")).to.be.false;
  })
})
