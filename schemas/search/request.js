
export default {
  type: "object",
  required: [
    "q"
  ],
  properties: {
    q: { type: "string" },
    center: { type: "string" },
    radius: {
      type: "string",
      pattern: "^\\d+$"
    },
    limit: {
      type: "string",
      pattern: "^\\d+$"
    }
  }
}
