
export default {
  type: "object",
  required: [
    "stops"
  ],
  properties: {
    stops: {
      description: "A string of pipe(|) separated stops. Each stop can be either an address or a set of coordinates. Stop modifiers can be added before any address separated by a colon(;)",
      type: "string",
      examples: [
        "type:origin;1676 40th Street, Calgary, AB|235 Heritage Drive, Calgary, AB|3368 Heritage Drive, Calgary, AB|1956 Fourth Avenue, Calgary, AB|type:destination;785 7th Ave, Calgary, AB"
      ]
    },
    arrival_time: { type: "string" },
    departure_time: { type: "string" },
    avoid_highways: { type: "string" },
    region: { type: "string" },
    traffic_model: { type: "string" },
    units: { type: "string" }
  }
}
