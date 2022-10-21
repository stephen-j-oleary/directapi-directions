
import Address from "./Address.js";

export default class Location {
  static Builder = class {
    setId(val) {
      this.id = val;
      return this;
    }

    setCoordinates(lat, lng) {
      this.lat = lat;
      this.lng = lng;
      return this;
    }

    setAddress(val) {
      this.address = val;
      return this;
    }

    build() {
      return new Location(this);
    }
  }

  constructor(props = {}) {
    const { address } = props;

    this.id = props.id;
    this.lat = props.lat;
    this.lng = props.lng;
    this.address = (address instanceof Address) ? address : new Address(address);
  }
}