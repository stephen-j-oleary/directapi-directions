
export default {
  $id: "/schemas/bounds",
  type: "object",
  required: [
    "ne",
    "sw"
  ],
  properties: {
    ne: { $ref: "/schemas/latLng" },
    sw: { $ref: "/schemas/latLng" }
  }
}