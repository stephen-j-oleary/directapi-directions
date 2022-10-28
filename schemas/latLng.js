
export default {
  $id: "/schemas/latLng",
  type: "object",
  required: [
    "lat",
    "lng"
  ],
  properties: {
    lat: { type: "number" },
    lng: { type: "number" }
  }
}
