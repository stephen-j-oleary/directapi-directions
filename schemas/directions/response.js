
export default {
  $id: "/schemas/directions/response",
  type: "object",
  required: [
    "routes"
  ],
  properties: {
    routes: { $ref: "#/$defs/routes" }
  },
  $defs: {
    routes: {
      type: "array",
      items: {
        type: "object",
        required: [
          "bounds",
          "legs",
          "polyline",
          "summary",
          "stopOrder",
        ],
        properties: {
          bounds: { $ref: "/schemas/bounds" },
          copyright: { type: "string" },
          legs: { $ref: "#/$defs/legs" },
          polyline: { type: "string" },
          stopOrder: {
            type: "array",
            items: { type: "number" }
          },
          summary: { type: "string" },
          warnings: {
            type: "array",
            items: { type: "string" }
          },
          fare: { $ref: "/schemas/currencyTextValue" }
        }
      }
    },
    legs: {
      type: "array",
      items: {
        type: "object",
        required: [
          "end",
          "start",
          "steps"
        ],
        properties: {
          end: { $ref: "/schemas/location" },
          start: { $ref: "/schemas/location" },
          steps: { $ref: "#/$defs/steps" },
          distance: { $ref: "/schemas/textValue" },
          duration: { $ref: "/schemas/textValue" },
          trafficDuration: { $ref: "/schemas/textValue" },
        }
      }
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        required: [
          "end",
          "start",
          "instructions",
          "polyline"
        ],
        properties: {
          end: { $ref: "/schemas/latLng" },
          start: { $ref: "/schemas/latLng" },
          instructions: { type: "string" },
          polyline: { type: "string" },
          distance: { $ref: "/schemas/textValue" },
          duration: { $ref: "/schemas/textValue" },
          maneuver: { type: "string" },
          steps: { $ref: "#/$defs/steps" }
        }
      }
    }
  }
}
