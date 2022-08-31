const chai = require("./chai.js"),
      sinon = require("sinon"),
      expect = chai.expect;

const { Google } = require("../Google.js"),
      Directions = require("../Directions.js");


describe("class Directions", () => {
  let directions;

  beforeEach(() => {
    directions = new Directions();
  });
  afterEach(() => {
    sinon.restore();
  });


  describe("static method sendRequest", () => {
    let googleSendRequestStub;

    beforeEach(() => {
      googleSendRequestStub = sinon.stub(Google, "sendRequest").resolves({});
    });

    it("should call Google sendRequest method", () => {
      Directions.sendRequest({});

      return expect(googleSendRequestStub).to.have.been.calledOnce;
    });

    it("should pass options to Google sendRequest call", () => {
      const options = {
        sample: "options",
        that: "should",
        be: "passed"
      };

      Directions.sendRequest(options);

      return expect(googleSendRequestStub).to.have.been.calledOnceWith("directions/json", options);
    });
  });


  describe("static method parseStops", () => {
    it("should throw if invalid argument is sent", () => {
      return expect(() => Directions.parseStops()).to.throw(TypeError, "Invalid argument");
    });

    it("should return an array of objects of the expected format", () => {
      const res = Directions.parseStops("start:1676 40th Street, Calgary, AB|3368 Heritage Drive, Calgary, AB|235 Heritage Drive, Calgary, AB|1956 Fourth Avenue, Calgary, AB|end:785 7th Ave, Calgary, AB");

      return Promise.all([
        expect(res).to.be.an("array").with.lengthOf(5),
        ...res.map(s => expect(s).to.be.an("object").with.any.keys("start", "end", "address"))
      ]);
    })
  });


  describe("method constructor", () => {
    it("should create a new instance of the Directions class", () => {
      return expect(directions).to.be.instanceOf(Directions);
    });
  });


  describe("method setStops", () => {
    it("should throw if invalid argument is sent", () => {
      return expect(() => directions.setStops()).to.throw(TypeError, "Invalid argument");
    });

    it("should set stop objects on the directions instance", () => {
      const stops = [
        { address: "Address1", start: true },
        { address: "Address2", end: true }
      ];

      directions.setStops(stops);

      return Promise.all([
        expect(directions.stops).to.be.an("array"),
        expect(directions.stops).to.have.lengthOf(2),
        ...directions.stops.map(s => expect(s).to.be.an("object").with.property("address"))
      ]);
    });

    it("should convert stop strings to stop objects", () => {
      const stops = ["Address1", "Address2"];

      directions.setStops(stops);

      return Promise.all([
        expect(directions.stops).to.be.an("array"),
        expect(directions.stops).to.have.lengthOf(2),
        ...directions.stops.map(s => expect(s).to.be.an("object").with.property("address")),
      ]);
    });

    it("should add indexes to stop objects", () => {
      const stops = [
        { address: "Address1", start: true },
        { address: "Address2", end: true }
      ];

      directions.setStops(stops);

      return Promise.all([
        expect(directions.stops).to.be.an("array"),
        expect(directions.stops).to.have.lengthOf(2),
        ...directions.stops.map(s => expect(s).to.be.an("object").with.property("index"))
      ]);
    });
  });


  describe("get start", () => {
    it("should return an object of the expected format", () => {
      directions.setStops([
        "Address1",
        "Address2"
      ]);

      const res = directions.start;
      return Promise.all([
        expect(res).to.be.an("object"),
        expect(res).to.have.property("index").and.to.be.a("number"),
        expect(res).to.have.property("address").and.to.be.a("string")
      ]);
    });

    it("should return expected value (only start; with stops)", () => {
      directions.setStops([
        { address: "Address1", start: true },
        "Address2",
        "Address3"
      ]);

      return expect(directions.start).to.deep.equal({ index: 0, address: "Address1", start: true });
    });

    it("should return expected value (only end; with stops)", () => {
      directions.setStops([
        "Address1",
        "Address2",
        { address: "Address3", end: true }
      ]);

      return expect(directions.start).to.deep.equal({ index: 2, address: "Address3", end: true });
    });

    it("should return expected value (no start or end; with stops)", () => {
      directions.setStops([
        "Address1",
        "Address2",
        "Address3"
      ]);

      return expect(directions.start).to.deep.equal({ index: 0, address: "Address1" });
    });
  });


  describe("get end", () => {
    it("should return an object of the expected format", () => {
      directions.setStops([
        "Address1",
        "Address2"
      ]);

      const res = directions.end;
      return Promise.all([
        expect(res).to.be.an("object"),
        expect(res).to.have.property("address").and.to.be.a("string")
      ]);
    });

    it("should return expected value (only end; with stops)", () => {
      directions.setStops([
        "Address1",
        "Address2",
        { address: "Address3", end: true }
      ]);

      return expect(directions.end).to.deep.equal({ index: 2, address: "Address3", end: true });
    });

    it("should return expected value (only start; with stops)", () => {
      directions.setStops([
        { address: "Address1", start: true },
        "Address2",
        "Address3"
      ]);

      return expect(directions.end).to.deep.equal({ index: 0, address: "Address1", start: true });
    });

    it("should return expected value (no start or end; with stops)", () => {
      directions.setStops([
        "Address1",
        "Address2",
        "Address3"
      ]);

      return expect(directions.end).to.deep.equal({ index: 0, address: "Address1" });
    });
  });


  describe("get middleStops", () => {
    it("should return an array of the expected format", () => {
      directions.setStops([
        "Address1",
        "Address2"
      ]);

      const res = directions.middleStops;
      return Promise.all([
        expect(res).to.be.an("array"),
        expect(res[0]).to.have.property("address").and.to.be.a("string")
      ]);
    });

    it("should return expected value (only start; with stops)", () => {
      directions.setStops([
        { address: "Address1", start: true },
        "Address2",
        "Address3"
      ]);

      return expect(directions.middleStops).to.deep.equal([
        { index: 1, address: "Address2" },
        { index: 2, address: "Address3" }
      ]);
    });

    it("should return expected value (only end; with stops)", () => {
      directions.setStops([
        { address: "Address1", end: true },
        "Address2",
        "Address3"
      ]);

      return expect(directions.middleStops).to.deep.equal([
        { index: 1, address: "Address2" },
        { index: 2, address: "Address3" }
      ]);
    });

    it("should return expected value (start and end; with stops)", () => {
      directions.setStops([
        { address: "Address1", start: true },
        "Address2",
        { address: "Address3", end: true }
      ]);

      return expect(directions.middleStops).to.deep.equal([
        { index: 1, address: "Address2" }
      ]);
    });

    it("should return expected value (no start or end; with stops)", () => {
      directions.setStops([
        "Address1",
        "Address2",
        "Address3"
      ]);

      return expect(directions.middleStops).to.deep.equal([
        { index: 1, address: "Address2" },
        { index: 2, address: "Address3" }
      ]);
    });
  });


  describe("get hasStart", () => {
    it("should return a boolean", () => {
      directions.setStops([
        { address: "Address1", start: true }
      ]);

      return expect(directions.hasStart).to.be.a("boolean");
    });

    it("should return a true if start was sent", () => {
      directions.setStops([
        { address: "Address1", start: true }
      ]);

      return expect(directions.hasStart).to.equal(true);
    });

    it("should return a false if start was not sent", () => {
      directions.setStops([
        "Address1"
      ]);

      return expect(directions.hasStart).to.equal(false);
    });
  });


  describe("get hasEnd", () => {
    it("should return a boolean", () => {
      directions.setStops([
        { address: "Address1", end: true }
      ]);

      return expect(directions.hasEnd).to.be.a("boolean");
    });

    it("should return a true if end was sent", () => {
      directions.setStops([
        { address: "Address1", end: true }
      ]);

      return expect(directions.hasEnd).to.equal(true);
    });

    it("should return a false if end was not sent", () => {
      directions.setStops([
        "Address1"
      ]);

      return expect(directions.hasEnd).to.equal(false);
    });
  });


  describe("method calculate", () => {
    let sendRequestStub;

    beforeEach(() => {
      directions.setStops(["Address1", "Address2"]);
      sendRequestStub = sinon.stub(Directions, "sendRequest").resolves({
        status: "OK",
        routes: [{
          copyrights: "Copyright",
          warnings: [],
          waypoint_order: [],
          legs: [
            { distance: { value: 1000 }, duration_in_traffic: { value: 120 }, start_address: "2295 7th Ave, Calgary, AB", end_address: "2836 Heritage Drive, Calgary, AB" },
            { distance: { value: 1000 }, duration_in_traffic: { value: 120 }, start_address: "2836 Heritage Drive, Calgary, AB", end_address: "2295 7th Ave, Calgary, AB" }
          ]
        }]
      });
    });


    it("should reject if invalid argument is sent", () => {
      return expect(directions.calculate("string")).to.be.rejectedWith(TypeError, "Invalid argument");
    });

    it("should reject if too few stops are sent", () => {
      sendRequestStub.rejects(new Error("Error"));
      directions.setStops(["Address1"]);

      return expect(directions.calculate()).to.be.rejectedWith(Error, "Too few stops");
    });

    it("should reject if call to sendRequest method fails", () => {
      sendRequestStub.rejects(new Error("Error"));

      return expect(directions.calculate()).to.be.rejectedWith(Error, "Error");
    });

    it("should set copyright property", async () => {
      await directions.calculate();

      return expect(directions).to.have.property("copyright").and.to.equal("Copyright");
    });

    it("should set warnings property", async () => {
      await directions.calculate();

      return expect(directions).to.have.property("warnings").and.to.deep.equal([]);
    });

    it("should set legs property", async () => {
      await directions.calculate();

      return expect(directions).to.have.property("legs").and.to.be.an("array").with.lengthOf(1);
    });

    it("should set stopOrder property", async () => {
      await directions.calculate();

      return expect(directions).to.have.property("stopOrder").and.to.deep.equal([0]);
    });

    it("should resolve with no value", () => {
      return expect(directions.calculate()).to.have.been.fulfilled;
    });

    it("should call sendRequest method once", async () => {
      await directions.calculate();

      return expect(sendRequestStub).to.have.been.calledOnce;
    });
  });

  describe("get response", () => {
    it("should be an object", () => {
      return expect(directions.response).to.be.an("object");
    });

    it("should be an empty object if no route has been calculated", () => {
      return expect(directions.response).to.be.an("object").and.to.deep.equal({});
    });

    it("should return an object containing the calculated route information", () => {
      directions.copyright = "Copyright";
      directions.warnings = [];
      directions.stopOrder = [0];
      directions.legs = [
        { distance: { value: 1000 }, duration_in_traffic: { value: 120 }, start_address: "2295 7th Ave, Calgary, AB", end_address: "2836 Heritage Drive, Calgary, AB" }
      ];

      const res = directions.response;
      return Promise.all([
        expect(res).to.be.an("object"),
        expect(res).to.have.property("copyright").that.is.a("string"),
        expect(res).to.have.property("warnings").that.is.an("array"),
        expect(res).to.have.property("stopOrder").that.is.an("array"),
        expect(res).to.have.property("legs").that.is.an("array"),
        ...res.legs.map(l => Promise.all([
          expect(l).to.have.property("distance").that.is.a("number"),
          expect(l).to.have.property("duration").that.is.a("number"),
          expect(l).to.have.property("start").that.is.a("string"),
          expect(l).to.have.property("end").that.is.a("string")
        ]))
      ]);
    });
  });
});