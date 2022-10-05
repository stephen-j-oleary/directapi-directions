
import { expect } from "../chai.js";
import axios from "axios";
import AxiosMock from "axios-mock-adapter";
import getDirections from "../../services/google/getDirections.js";
import Directions from "../../services/google/Directions.js";
import Stops from "../../services/Stops.js";
import * as responseSchema from "../../schemas/directionsResponse.json" assert { type: "json" };

describe("module getDirections", () => {
  let directions, axiosMock;

  const requestOptions = {
    stops: new Stops("origin:address1|address2|address3|destination:address4")
  };
  const expectedRequestPattern = {
    type: "object",
    required: ["key", "origin", "destination"],
    properties: {
      key: "string",
      alternatives: "boolean",
      mode: {
        type: "string",
        enum: ["driving"]
      },
      traffic_model: {
        type: "string",
        enum: ["best_guess", "optimistic", "pessimistic"]
      },
      units: {
        type: "string",
        enum: ["metric", "imperial"]
      },
      origin: "string",
      destination: "string",
      arrival_time: "string",
      avoid: "string",
      departure_time: "string",
      region: "string",
      waypoints: {
        type: "string",
        not: { pattern: /\[object Object\]/ }
      }
    }
  };

  beforeEach(async () => {
    axiosMock = new AxiosMock(axios);
    axiosMock.history
    axiosMock.onGet().reply(200, {
      status: "OK",
      routes: [
        {
          copyrights: "Map data ©2022 Inst. Geogr. Nacional",
          summary: "A-42",
          warnings: [],
          waypoint_order: [],
          legs: [
            {
              distance: { text: "74.3 km", value: 74327 },
              duration: { text: "57 mins", value: 3446 },
              end_address: "Madrid, Spain",
              start_address: "Toledo, Spain",
              steps: [
                {
                  distance: { text: "0.6 km", value: 615 },
                  duration: { text: "2 mins", value: 106 },
                  end_location: { lat: 39.8681019, lng: -4.029378299999999 },
                  html_instructions: "Head <b>northwest</b> on <b>Av. de la Reconquista</b> toward <b>C. de la Diputación</b>",
                  start_location: { lat: 39.862808, lng: -4.0273727 }
                },
                {
                  distance: { text: "0.2 km", value: 174 },
                  duration: { text: "1 min", value: 24 },
                  end_location: { lat: 39.8675297, lng: -4.0275807 },
                  html_instructions: "At the roundabout, take the <b>1st</b> exit onto <b>C. Duque de Lerma</b>",
                  maneuver: "roundabout-right",
                  start_location: { lat: 39.8681019, lng: -4.029378299999999 },
                },
                {
                  distance: { text: "0.6 km", value: 594 },
                  duration: { text: "2 mins", value: 91 },
                  end_location: { lat: 39.8688577, lng: -4.021535 },
                  html_instructions: 'At the roundabout, take the <b>3rd</b> exit onto <b>Av. Gral. Villalba</b><div style="font-size:0.9em">Go through 1 roundabout</div>',
                  maneuver: "roundabout-right",
                  start_location: { lat: 39.8675297, lng: -4.0275807 }
                },
                {
                  distance: { text: "0.2 km", value: 198 },
                  duration: { text: "1 min", value: 29 },
                  end_location: { lat: 39.8700417, lng: -4.0208568 },
                  html_instructions: "At the roundabout, take the <b>3rd</b> exit onto <b>Av. de Madrid</b>",
                  maneuver: "roundabout-right",
                  start_location: { lat: 39.8688577, lng: -4.021535 }
                },
                {
                  distance: { text: "0.4 km", value: 415 },
                  duration: { text: "1 min", value: 57 },
                  end_location: { lat: 39.8737356, lng: -4.0207605 },
                  html_instructions: "Turn <b>right</b> to stay on <b>Av. de Madrid</b>",
                  maneuver: "turn-right",
                  start_location: { lat: 39.8700417, lng: -4.0208568 }
                },
                {
                  distance: { text: "1.1 km", value: 1065 },
                  duration: { text: "1 min", value: 67 },
                  end_location: { lat: 39.8830007, lng: -4.0190202 },
                  html_instructions: "At the roundabout, take the <b>2nd</b> exit onto the <b>A-42</b> ramp to <b>Madrid</b>",
                  maneuver: "roundabout-right",
                  start_location: { lat: 39.8737356, lng: -4.0207605 },
                },
                {
                  distance: { text: "19.2 km", value: 19159 },
                  duration: { text: "11 mins", value: 650 },
                  end_location: { lat: 40.0333486, lng: -3.925665899999999 },
                  html_instructions: "Merge onto <b>A-42</b>",
                  maneuver: "merge",
                  start_location: { lat: 39.8830007, lng: -4.0190202 }
                },
                {
                  distance: { text: "47.1 km", value: 47071 },
                  duration: { text: "30 mins", value: 1825 },
                  end_location: { lat: 40.3957623, lng: -3.7039499 },
                  html_instructions: "Keep <b>left</b> to stay on <b>A-42</b>",
                  maneuver: "keep-left",
                  start_location: { lat: 40.0333486, lng: -3.925665899999999 }
                },
                {
                  distance: { text: "1.7 km", value: 1693 },
                  duration: { text: "1 min", value: 88 },
                  end_location: { lat: 40.4001319, lng: -3.7183967 },
                  html_instructions: "Take exit <b>2A</b> to merge onto <b>M-30</b> toward <b>A-5</b>/<wbr/><b>Badajoz</b>/<wbr/><b>A-6</b>",
                  maneuver: "ramp-right",
                  start_location: { lat: 40.3957623, lng: -3.7039499 }
                },
                {
                  distance: { text: "0.5 km", value: 473 },
                  duration: { text: "1 min", value: 36 },
                  end_location: { lat: 40.4026657, lng: -3.7219427 },
                  html_instructions: "Keep <b>left</b> to stay on <b>M-30</b>",
                  maneuver: "keep-left",
                  start_location: { lat: 40.4001319, lng: -3.7183967 }
                },
                {
                  distance: { text: "0.7 km", value: 692 },
                  duration: { text: "1 min", value: 35 },
                  end_location: { lat: 40.40876859999999, lng: -3.7214006 },
                  html_instructions: "Keep <b>left</b> to stay on <b>M-30</b>",
                  maneuver: "keep-left",
                  start_location: { lat: 40.4026657, lng: -3.7219427 }
                },
                {
                  distance: { text: "0.3 km", value: 259 },
                  duration: { text: "1 min", value: 28 },
                  end_location: { lat: 40.4110837, lng: -3.721353 },
                  html_instructions: "Slight <b>right</b> (signs for <b>Pᵒ V. del Puerto</b>/<wbr/><b>C/<wbr/> Segovia</b>)",
                  maneuver: "turn-slight-right",
                  start_location: { lat: 40.40876859999999, lng: -3.7214006 }
                },
                {
                  distance: { text: "0.3 km", value: 324 },
                  duration: { text: "1 min", value: 55 },
                  end_location: { lat: 40.4139789, lng: -3.7209563 },
                  html_instructions: "Merge onto <b>P.º de la Virgen del Puerto</b>",
                  maneuver: "merge",
                  start_location: { lat: 40.4110837, lng: -3.721353 }
                },
                {
                  distance: { text: "0.8 km", value: 764 },
                  duration: { text: "2 mins", value: 114 },
                  end_location: { lat: 40.413898, lng: -3.7119377 },
                  html_instructions: "Turn <b>right</b> onto <b>C. de Segovia</b>",
                  maneuver: "turn-right",
                  start_location: { lat: 40.4139789, lng: -3.7209563 }
                },
                {
                  distance: { text: "0.1 km", value: 95 },
                  duration: { text: "1 min", value: 26 },
                  end_location: { lat: 40.4144408, lng: -3.712543399999999 },
                  html_instructions: "Turn <b>left</b> onto <b>C. de la Villa</b>",
                  maneuver: "turn-left",
                  start_location: { lat: 40.413898, lng: -3.7119377 }
                },
                {
                  distance: { text: "84 m", value: 84 },
                  duration: { text: "1 min", value: 23 },
                  end_location: { lat: 40.414991, lng: -3.7122205 },
                  html_instructions: "<b>C. de la Villa</b> turns <b>right</b> and becomes <b>C. del Pretil de los Consejos</b>",
                  start_location: { lat: 40.4144408, lng: -3.712543399999999 }
                },
                {
                  distance: { text: "26 m", value: 26 },
                  duration: { text: "1 min", value: 8 },
                  end_location: { lat: 40.4152243, lng: -3.712259699999999 },
                  html_instructions: "Turn <b>left</b> onto <b>C. del Sacramento</b>",
                  maneuver: "turn-left",
                  start_location: { lat: 40.414991, lng: -3.7122205 }
                },
                {
                  distance: { text: "0.6 km", value: 626 },
                  duration: { text: "3 mins", value: 184 },
                  end_location: { lat: 40.4165207, lng: -3.705076 },
                  html_instructions: "Turn <b>right</b> onto <b>C. Mayor</b>",
                  maneuver: "turn-right",
                  start_location: { lat: 40.4152243, lng: -3.712259699999999 }
                }
              ]
            }
          ]
        }
      ]
    });

    directions = await getDirections(requestOptions);
  })
  afterEach(() => {
    axiosMock.restore();
  });

  it("should send expected request to Google api", () => {
    return expect(axiosMock.history.get[0].params).to.have.jsonSchema(expectedRequestPattern);
  });

  it("should be a Directions instance", () => {
    return expect(directions).to.be.an.instanceOf(Directions);
  })

  it("should have expected json pattern", () => {
    return expect(directions).to.have.jsonSchema(responseSchema);
  })

  it("should reject if too few stops are sent", () => {
    const options = {
      stops: new Stops("origin:address1")
    };

    return expect(getDirections(options)).to.be.rejectedWith("Too few stops");
  })
})
