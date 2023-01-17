
import Location from "../../services/Location.js";
import Address from "../../services/Address.js";
import { expect } from "../chai.js";

describe("class Location", () => {
  let location;
  const addressProps = {
    formatted_address: "1 1st Street SW Calgary",
    number: 1,
    street: "1st Street SW",
    city: "Calgary"
  };
  const props = {
    id: "id",
    lat: "lat",
    lng: "lng",
    address: new Address(addressProps),
    distance: 1200,
    full_text: "text",
    full_text_match: { offset: 0, length: 3 },
    main_text: "text",
    main_text_match: { offset: 0, length: 3 },
    secondary_text: "text",
    invalid: "property"
  };

  beforeEach(() => {
    location = new Location(props);
  })

  it("should have expected properties", () => {
    const expected = ["id", "lat", "lng", "address", "distance", "full_text", "full_text_match", "main_text", "main_text_match", "secondary_text"];

    return expect(location).to.include.all.keys(expected);
  })

  it("should handle missing or empty props", () => {
    location = new Location();

    return expect(location).to.be.an.instanceOf(Location);
  })

  it("should create an Address instance if a plain object is passed", () => {
    location = new Location({ address: addressProps });

    expect(location.address).to.be.an.instanceOf(Address);
    for (const key in addressProps) {
      const element = addressProps[key];
      expect(location.address).to.have.property(key, element);
    }
    return;
  })
})
