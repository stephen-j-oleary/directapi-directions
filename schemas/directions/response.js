
export default {
  type: "object",
  required: [
    "routes"
  ],
  properties: {
    routes: {
      type: "array",
      items: {
        type: "object",
        required: [
          "summary",
          "stopOrder",
          "legs"
        ],
        properties: {
          summary: { type: "string" },
          stopOrder: {
            type: "array",
            items: { type: "number" }
          },
          fare: {
            type: [
              "object",
              "undefined"
            ],
            required: [
              "currency",
              "text",
              "value"
            ],
            properties: {
              currency: { type: "string" },
              text: { type: "string" },
              value: { type: "number" }
            }
          },
          legs: { type: "array" }
        }
      }
    }
  }
}
