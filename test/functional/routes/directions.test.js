
import chai, { expect } from "../../chai.js";
import app from "../../../app.js";

describe("route directions", () => {
  const PROXY_SECRET = process.env.RAPIDAPI_PROXY_SECRET;
  const PATH = "/directions";
  let server;

  before(() => {
    server = chai.request(app).keepOpen();
  });
  after(() => server.close());


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

    it("should respond with 400 if too few stops are sent", async () => {
      const response = await server
        .get(PATH)
        .set("X-RapidAPI-Proxy-Secret", PROXY_SECRET)
        .query({ stops: "105 Skyview Manor, NE" });

      return Promise.all([
        expect(response).to.have.status(400),
        expect(response).to.be.json,
        expect(response.body).to.have.property("message").and.to.be.a("string")
      ]);
    });

    it("should respond with 200 on successful request", async () => {
      const response = await server
        .get(PATH)
        .set("X-RapidAPI-Proxy-Secret", PROXY_SECRET)
        .query({ stops: "105 Skyview Manor, NE|18 Sydney Dr, SW" });

      return expect(response).to.have.status(200);
    });

    it("should respond with expected body on successful request", async () => {
      const expectedResponsePattern = {
        type: "object",
        required: ["routes"],
        properties: {
          routes: {
            type: "array",
            items: {
              type: "object",
              required: ["summary", "stopOrder", "legs"],
              properties: {
                summary: "string",
                stopOrder: {
                  type: "array",
                  items: "number"
                },
                fare: ["object", "undefined"],
                legs: {
                  type: "array"
                },
              }
            }
          }
        }
      };

      const response = await server
        .get(PATH)
        .set("X-RapidAPI-Proxy-Secret", PROXY_SECRET)
        .query({ stops: "105 Skyview Manor, NE|18 Sydney Dr, SW" });

      return expect(response.body).to.have.jsonSchema(expectedResponsePattern);
    });
  });
});
