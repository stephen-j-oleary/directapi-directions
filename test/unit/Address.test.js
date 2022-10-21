
import Address from "../../services/Address.js";
import { expect } from "../chai.js";

describe("class Address", () => {
  let address;
  const props = {
    full_address: "2560 Heritage Drive SW, Calgary, AB",
    number: "2560",
    street: "Heritage Drive SW",
    city: "Calgary",
    state: "Alberta"
  };

  beforeEach(() => {
    address = new Address(props);
  })

  it("should have expected properties", () => {
    const expected = ["formatted_address", "number", "street", "city", "state", "country", "postal_code"];

    return expect(address).to.include.all.keys(expected);
  })

  it("should handle missing or empty props", () => {
    address = new Address();

    return expect(address).to.be.an.instanceOf(Address);
  })
})
