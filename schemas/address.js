
export default {
  $id: "/schemas/address",
  type: "object",
  required: [
    "formattedAddress"
  ],
  properties: {
    formattedAddress: { type: "string" },
    number: { type: "string" },
    street: { type: "string" },
    city: { type: "string" },
    state: { type: "string" },
    country: { type: "string" },
    postal_code: { type: "string" }
  }
}
