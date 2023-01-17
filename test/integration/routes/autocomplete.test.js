
import chai, { expect } from "../../chai.js";
import axios from "axios";
import AxiosMock from "axios-mock-adapter";
import app from "../../../app.js";
import responseSchema from "../../../schemas/autocomplete/response.js";

describe("route autocomplete", () => {
  const PROXY_SECRET = process.env.RAPIDAPI_PROXY_SECRET;
  const PATH = "/autocomplete";
  let server, axiosMock;

  before(() => {
    server = chai.request(app).keepOpen();
  });
  after(() => server.close());

  beforeEach(() => {
    axiosMock = new AxiosMock(axios);
    axiosMock.onGet().reply(200, {
      status: "OK",
      predictions: [
        {
          description: "Paris, France",
          matched_substrings: [{ length: 5, offset: 0 }],
          place_id: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
          reference: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
          structured_formatting: {
            main_text: "Paris",
            main_text_matched_substrings: [{ length: 5, offset: 0 }],
            secondary_text: "France"
          },
          terms: [
            { offset: 0, value: "Paris" },
            { offset: 7, value: "France" }
          ],
          types: ["locality", "political", "geocode"]
        },
        {
          description: "Paris, TX, USA",
          matched_substrings: [{ length: 5, offset: 0 }],
          place_id: "ChIJmysnFgZYSoYRSfPTL2YJuck",
          reference: "ChIJmysnFgZYSoYRSfPTL2YJuck",
          structured_formatting: {
            main_text: "Paris",
            main_text_matched_substrings: [{ length: 5, offset: 0 }],
            secondary_text: "TX, USA"
          },
          terms: [
            { offset: 0, value: "Paris" },
            { offset: 7, value: "TX" },
            { offset: 11, value: "USA" }
          ],
          types: ["locality", "political", "geocode"]
        },
        {
          description: "Paris, TN, USA",
          matched_substrings: [{ "length": 5, "offset": 0 }],
          place_id: "ChIJ4zHP-Sije4gRBDEsVxunOWg",
          reference: "ChIJ4zHP-Sije4gRBDEsVxunOWg",
          structured_formatting: {
            main_text: "Paris",
            main_text_matched_substrings: [{ length: 5, offset: 0 }],
            secondary_text: "TN, USA"
          },
          terms: [
            { offset: 0, value: "Paris" },
            { offset: 7, value: "TN" },
            { offset: 11, value: "USA" }
          ],
          types: ["locality", "political", "geocode"]
        },
        {
          description: "Paris, Brant, ON, Canada",
          matched_substrings: [{ "length": 5, "offset": 0 }],
          place_id: "ChIJsamfQbVtLIgR-X18G75Hyi0",
          reference: "ChIJsamfQbVtLIgR-X18G75Hyi0",
          structured_formatting: {
            main_text: "Paris",
            main_text_matched_substrings: [{ length: 5, offset: 0 }],
            secondary_text: "Brant, ON, Canada"
          },
          terms: [
            { offset: 0, value: "Paris" },
            { offset: 7, value: "Brant" },
            { offset: 14, value: "ON" },
            { offset: 18, value: "Canada" }
          ],
          types: ["neighborhood", "political", "geocode"]
        },
        {
          description: "Paris, KY, USA",
          matched_substrings: [{ "length": 5, "offset": 0 }],
          place_id: "ChIJsU7_xMfKQ4gReI89RJn0-RQ",
          reference: "ChIJsU7_xMfKQ4gReI89RJn0-RQ",
          structured_formatting: {
            main_text: "Paris",
            main_text_matched_substrings: [{ length: 5, offset: 0 }],
            secondary_text: "KY, USA"
          },
          terms: [
            { offset: 0, value: "Paris" },
            { offset: 7, value: "KY" },
            { offset: 11, value: "USA" }
          ],
          types: ["locality", "political", "geocode"]
        }
      ]
    });
  })
  afterEach(() => axiosMock.restore())


  describe("get", () => {
    it("should respond with 400 if required parameters are not sent", async () => {
      const response = await server
        .get(PATH)
        .set("X-RapidAPI-Proxy-Secret", PROXY_SECRET);

      return Promise.all([
        expect(response).to.have.status(400),
        expect(response).to.be.json,
        expect(response.body).to.have.property("message").and.to.be.a("string")
      ]);
    });

    it("should respond with 500 if google maps could not be reached", async () => {
      axiosMock.onGet().reply(500);

      const response = await server
        .get(PATH)
        .set("X-RapidAPI-Proxy-Secret", PROXY_SECRET)
        .query({ q: "123" });

      return Promise.all([
        expect(response).to.have.status(500),
        expect(response).to.be.json,
        expect(response.body).to.have.property("message").and.to.be.a("string")
      ]);
    });

    it("should respond with 200 on successful request", async () => {
      const response = await server
        .get(PATH)
        .set("X-RapidAPI-Proxy-Secret", PROXY_SECRET)
        .query({ q: "123" });

      return expect(response).to.have.status(200);
    });

    it("should respond with expected body on successful request", async () => {
      const response = await server
        .get(PATH)
        .set("X-RapidAPI-Proxy-Secret", PROXY_SECRET)
        .query({ q: "123" });

      return expect(response.body).to.have.jsonSchema(responseSchema);
    });
  });
});
