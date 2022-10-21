
export default {
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
          address: {
            type: "object",
            required: [
              "formatted_address"
            ],
            properties: {
              formatted_address: { type: "string" },
              number: { type: ["string", "undefined"] },
              street: { type: ["string", "undefined"] },
              city: { type: ["string", "undefined"] },
              state: { type: ["string", "undefined"] },
              country: { type: ["string", "undefined"] },
              postal_code: { type: ["string", "undefined"] }
            }
          }
        }
      }
    }
  }
}
