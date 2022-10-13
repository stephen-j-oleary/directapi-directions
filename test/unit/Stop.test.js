
import { expect } from "../chai.js";
import Stop from "../../services/Stop.js";

describe("class Stop", () => {
  it("should have expected properties", done => {
    const address = "adress1";
    const modifiers = ["start"];

    const stop = new Stop({ address, modifiers });

    expect(stop).to.have.property("address").that.is.a("string");
    expect(stop).to.have.property("modifiers").that.is.an("array");
    done();
  })

  it("should have expected default properties", done => {
    const expectedDefaultAddress = "";
    const expectedDefaultModifiers = [];

    const stop = new Stop();

    expect(stop.address).to.equal(expectedDefaultAddress);
    expect(stop.modifiers).to.deep.equal(expectedDefaultModifiers);
    done();
  })

  it("should handle string initializer with modifiers", done => {
    const string = "type:origin;andOther:modifiers;address";
    const expectedAddress = "address";
    const expectedModifiers = { type: "origin", andOther: "modifiers" };

    const stop = new Stop(string);

    expect(stop.address).to.equal(expectedAddress);
    expect(stop.modifiers).to.deep.equal(expectedModifiers);
    done();
  })

  it("should handle string initializer without modifiers", done => {
    const string = "address";
    const expectedAddress = "address";
    const expectedModifiers = {};

    const stop = new Stop(string);

    expect(stop.address).to.equal(expectedAddress);
    expect(stop.modifiers).to.deep.equal(expectedModifiers);
    done();
  })

  describe("method hasModifier", () => {
    const address = "address1";
    const modifiersWithOrigin = {
      type: "origin",
      andOther: "modifiers"
    };
    const modifiersWithoutOrigin = {
      type: "destination",
      andOther: "modifiers"
    };

    it("should return true when modifier is present", () => {
      const stop = new Stop({
        address,
        modifiers: modifiersWithOrigin
      });

      return expect(stop.hasModifier("type")).to.be.true;
    })

    it("should return true when modifier is present and value is correct", () => {
      const stop = new Stop({
        address,
        modifiers: modifiersWithOrigin
      });

      return expect(stop.hasModifier("type", "origin")).to.be.true;
    })

    it("should return false when modifier is not present", () => {
      const stop = new Stop({
        address,
        modifiers: modifiersWithOrigin
      });

      return expect(stop.hasModifier("missing")).to.be.false;
    })

    it("should return false when modifier is present but value is not correct", () => {
      const stop = new Stop({
        address,
        modifiers: modifiersWithoutOrigin
      });

      return expect(stop.hasModifier("type", "origin")).to.be.false;
    })

    it("should return false when no modifiers are present", () => {
      const stop = new Stop({ address });

      return expect(stop.hasModifier("type")).to.be.false;
    })
  })
})
