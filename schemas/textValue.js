
export default {
  $id: "/schemas/textValue",
  type: "object",
  required: [
    "text",
    "value"
  ],
  properties: {
    text: { type: "string" },
    value: { type: "number" }
  }
}
