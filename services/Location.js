
import _ from "lodash";
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

    setDistance(val) {
      this.distance = val;
      return this;
    }

    setText({ full, main, secondary } = {}) {
      this.full_text = full;
      this.main_text = main;
      this.secondary_text = secondary;
      return this;
    }

    setMatch({ full, main, secondary } = {}) {
      this.full_text_match = full;
      this.main_text_match = main;
      this.secondary_text_match = secondary;
      return this;
    }

    build() {
      return new Location(this);
    }
  }

  constructor(props = {}) {
    const { address } = props;
    this.address = (address instanceof Address) ? address : new Address(address);

    const ALLOWED_PROPS = ["id", "lat", "lng", "distance", "full_text", "full_text_match", "main_text", "main_text_match", "secondary_text", "secondary_text_match"];
    Object.assign(this, _.pick(props, ALLOWED_PROPS));
  }
}