
import _ from "lodash";

function fromString(str) {
  const [lat1, lng1, lat2, lng2] = str.split(",");

  return {
    ne: { lat: lat1, lng: lng1 },
    sw: { lat: lat2, lng: lng2 }
  }
}

export default class Bounds {
  constructor(
    props = {
      ne: { lat: undefined, lng: undefined },
      sw: { lat: undefined, lng: undefined }
    }
  ) {
    const { ne, sw } = _.isString(props) ? fromString(props) : props;

    this.ne = ne;
    this.sw = sw;
  }

  toString() {
    const coords = [
      this.ne.lat,
      this.ne.lng,
      this.sw.lat,
      this.sw.lng
    ];

    return (coords.every(item => item))
      ? coords.join(",")
      : "";
  }
}
