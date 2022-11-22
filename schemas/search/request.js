
export default {
  type: "object",
  required: [
    "q"
  ],
  properties: {
    q: { type: "string" },
    location: {
      type: "string",
      pattern: "^[\\+\\-]?[\\d\\.]+,[\\+\\-]?[\\d\\.]+$"
    },
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
