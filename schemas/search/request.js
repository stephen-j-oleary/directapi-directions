
export default {
  type: "object",
  required: [
    "q"
  ],
  properties: {
    q: { type: "string" },
    bias: {
      type: "string",
      anyOf: [
        { pattern: "^circle:\\d+:[\\+\\-]?[\\d\\.]+,[\\+\\-]?[\\d\\.]+$" }, // circle:{radius}:{lat},{lng}
        { pattern: "^rect:[\+\-]?[\d\.]+,[\+\-]?[\d\.]+,[\+\-]?[\d\.]+,[\+\-]?[\d\.]+$" } // rect:{south},{west},{north},{east}
      ]
    },
    restrict: {
      type: "string",
      anyOf: [
        { pattern: "^circle:\\d+:[\\+\\-]?[\\d\\.]+,[\\+\\-]?[\\d\\.]+$" }, // circle:{radius}:{lat},{lng}
        { pattern: "^rect:[\+\-]?[\d\.]+,[\+\-]?[\d\.]+,[\+\-]?[\d\.]+,[\+\-]?[\d\.]+$" }, // rect:{south},{west},{north},{east}
        { pattern: "^country:[A-Z]{2}$" } // country:{alpha2code}
      ]
    },
    limit: {
      type: "string",
      pattern: "^\\d+$"
    },
    location: {
      type: "string",
      pattern: "^[\+\-]?[\d\.]+,[\+\-]?[\d\.]+$" // {lat},{lng}
    }
  }
}
