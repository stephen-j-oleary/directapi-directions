
export default class Address {
  static Builder = class {
    setFormattedAddress(val) {
      this.formatted_address = val;
      return this;
    }

    setAddress(number, street) {
      this.number = number;
      this.street = street;
      return this;
    }

    setCity(val) {
      this.city = val;
      return this;
    }

    setState(val) {
      this.state = val;
      return this;
    }

    setCountry(val) {
      this.country = val;
      return this;
    }

    setPostalCode(val) {
      this.postal_code = val;
      return this;
    }

    build() {
      return new Address(this);
    }
  }

  constructor(props = {}) {
    this.formatted_address = props.formatted_address;
    this.number = props.number;
    this.street = props.street;
    this.city = props.city;
    this.state = props.state;
    this.country = props.country;
    this.postal_code = props.postal_code;
  }
}
