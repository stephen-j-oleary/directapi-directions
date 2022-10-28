
export default {
  $id: "/schemas/location",
  type: "object",
  required: [],
  properties: {
    address: { $ref: "/schemas/address" },
    lat: { type: "number" },
    lng: { type: "number" }
  }
}
