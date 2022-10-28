
export default {
  $id: "/schemas/search/response",
  type: "object",
  required: [
    "results"
  ],
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        required: [
          "id",
          "lat",
          "lng",
          "address"
        ],
        properties: {
          id: { type: "string" },
          lat: { type: "number" },
          lng: { type: "number" },
          address: { $ref: "/schemas/address" }
        }
      }
    }
  }
}
