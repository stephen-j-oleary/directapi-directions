
import { expect } from "../chai.js";
import Bounds from "../../services/Bounds.js";

describe("class Bounds", () => {
  it("should handle string argument", () => {
    const expectedProps = {
      ne: { lat: "0", lng: "0" },
      sw: { lat: "0", lng: "0" }
    };

    const bounds = new Bounds("0,0,0,0");

    return expect(bounds).to.be.an.instanceOf(Bounds).that.deep.includes(expectedProps);
  })

  it("should handle object argument", () => {
    const props = {
      ne: { lat: "0", lng: "0" },
      sw: { lat: "0", lng: "0" }
    };

    const bounds = new Bounds(props);

    return expect(bounds).to.be.an.instanceOf(Bounds).that.deep.includes(props);
  })

  it("should handle missing argument", () => {
    const bounds = new Bounds();

    return expect(bounds).to.be.an.instanceOf(Bounds);
  })

  it("should have expected default properties", () => {
    const expectedProps = {
      ne: { lat: undefined, lng: undefined },
      sw: { lat: undefined, lng: undefined }
    };

    const bounds = new Bounds();

    return expect(bounds).to.deep.include(expectedProps);
  })

  it("toString should return an empty string when bounds are undefined", () => {
    const bounds = new Bounds();

    return expect(bounds.toString()).to.equal("");
  })

  it("toString should return the proper string when bounds are defined", () => {
    const expectedString = "0,0,0,0";

    const bounds = new Bounds(expectedString);

    return expect(bounds.toString()).to.equal(expectedString);
  })
})