
import { expect } from "../../chai.js";
import DistanceMatrix, { DistanceMatrixElement } from "../../../services/google/DistanceMatrix.js";

describe("class DistanceMatrixElement", () => {
  let element;
  const distance = "distance";
  const duration = "duration";
  const trafficDuration = "trafficDuration";

  beforeEach(() => {
    element = new DistanceMatrixElement({ distance, duration, trafficDuration });
  })

  it("should have expected properties", done => {
    expect(element).to.have.property("distance").that.equals(distance);
    expect(element).to.have.property("duration").that.equals(duration);
    expect(element).to.have.property("trafficDuration").that.equals(trafficDuration);
    done();
  })
})

describe("class DistanceMatrixBuilder", () => {
  let builder;

  beforeEach(() => {
    builder = new DistanceMatrix.Builder();
  })

  it("should have expected properties", done => {
    expect(builder).to.have.property("origins").that.is.an("array");
    expect(builder).to.have.property("destinations").that.is.an("array");
    expect(builder).to.have.property("matrix").that.is.an("array");
    done();
  })

  it("should have expected default values", done => {
    expect(builder.origins).to.deep.equal([]);
    expect(builder.destinations).to.deep.equal([]);
    expect(builder.matrix).to.deep.equal([]);
    done();
  })

  it("should have expected methods", done => {
    const expectedMethods = [
      "setOrigins",
      "setDestinations",
      "setMatrix",
      "build"
    ];

    for (const method of expectedMethods) {
      expect(builder).to.have.property(method).that.is.a("function");
    }
    done();
  })

  it("setOrigins should replace expected property", () => {
    const value = [1, 2, 3];

    builder.setOrigins(value);

    return expect(builder.origins).to.deep.equal(value);
  })

  it("setDestinations should replace expected property", () => {
    const value = [1, 2, 3];

    builder.setDestinations(value);

    return expect(builder.destinations).to.deep.equal(value);
  })

  it("setMatrix should replace expected property", () => {
    const value = [[1, 2], [3, 4]];

    builder.setMatrix(value);

    return expect(builder.matrix).to.deep.equal(value);
  })

  it("build should create an instance of DistanceMatrix", () => {
    return expect(builder.build()).to.be.an.instanceOf(DistanceMatrix);
  })
})

describe("class DistanceMatrix", () => {
  let matrix;

  beforeEach(() => {
    matrix = new DistanceMatrix({
      origins: [1, 2, 3],
      destinations: [1, 2, 3],
      matrix: [[1, 2], [1, 2]]
    })
  })

  it("should have expected static properties", () => {
    return expect(DistanceMatrix).to.have.property("Builder").that.is.a("function");
  })

  it("should have expected properties", done => {
    expect(matrix).to.have.property("origins").that.is.an("array");
    expect(matrix).to.have.property("destinations").that.is.an("array");
    expect(matrix).to.have.property("matrix").that.is.an("array");
    done();
  })

  it("should have expected default properties", done => {
    matrix = new DistanceMatrix();

    expect(matrix.origins).to.deep.equal([]);
    expect(matrix.destinations).to.deep.equal([]);
    expect(matrix.matrix).to.deep.equal([]);
    done();
  })

  it("should replace invalid properties with default values", () => {
    matrix = new DistanceMatrix({ origins: "invalid" });

    return expect(matrix.origins).to.deep.equal([]);
  })
})
