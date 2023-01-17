
export default {
  $id: "/schemas/autocomplete/response",
  type: "object",
  required: [ "results" ],
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        required: [
          "id",
          "full_text",
          "full_text_match",
          "main_text",
          "main_text_match",
          "secondary_text"
        ],
        properties: {
          id: { type: "string" },
          full_text: { type: "string" },
          full_text_match: {
            type: "object",
            required: [ "offset", "length" ],
            properties: {
              offset: { type: "number" },
              length: { type: "number" }
            }
          },
          main_text: { type: "string" },
          main_text_match: {
            type: "object",
            required: [ "offset", "length" ],
            properties: {
              offset: { type: "number" },
              length: { type: "number" }
            }
          },
          secondary_text: { type: "string" },
          secondary_text_match: {
            type: "object",
            required: [ "offset", "length" ],
            properties: {
              offset: { type: "number" },
              length: { type: "number" }
            }
          },
          distance: { type: "number" }
        }
      }
    }
  }
}
