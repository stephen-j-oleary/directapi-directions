
import { expect } from "../chai.js";
import Stop from "../../Stop.js";

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
    const string = "origin:andOther:modifiers:address";
    const expectedAddress = "address";
    const expectedModifiers = ["origin", "andOther", "modifiers"];

    const stop = new Stop(string);

    expect(stop.address).to.equal(expectedAddress);
    expect(stop.modifiers).to.have.all.members(expectedModifiers);
    done();
  })

  it("should handle string initializer without modifiers", done => {
    const string = "address";
    const expectedAddress = "address";
    const expectedModifiers = [];

    const stop = new Stop(string);

    expect(stop.address).to.equal(expectedAddress);
    expect(stop.modifiers).to.deep.equal(expectedModifiers);
    done();
  })

  describe("method hasModifier", () => {
    const address = "address1";
    const modifiersWithOrigin = "origin:otherModifiers:thatMay:bePresent";
    const modifiersWithoutOrigin = "destination:otherModifiers";

    it("should return true when modifier is present", () => {
      const stop = new Stop({
        address,
        modifiers: modifiersWithOrigin
      });

      return expect(stop.hasModifier("origin")).to.be.true;
    })

    it("should return false when modifier is not present", () => {
      const stop = new Stop({
        address,
        modifiers: modifiersWithoutOrigin
      });

      return expect(stop.hasModifier("origin")).to.be.false;
    })

    it("should return false when no modifiers are present", () => {
      const stop = new Stop({ address });

      return expect(stop.hasModifier("origin")).to.be.false;
    })
  })
})
