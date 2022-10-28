
export default {
  $id: "/schemas/currencyTextValue",
  type: "object",
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
}