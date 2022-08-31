import chai from "chai";
import sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";
import chaiHttp from "chai-http";
import mongoose from "mongoose";
import axios from "axios";
import config from "../../config.js";
import app from "../app.js";

const { expect } = chai;

chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.use(chaiHttp);


async function removeAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const name of collections) {
    const collection = mongoose.connection.collections[name];
    await collection.deleteMany();
  }
}

async function dropAllCollections() {
  const collections = Object.keys(mongoose.connection.collections);
  for (const name of collections) {
    const collection = mongoose.connection.collections[name];
    await collection.drop().catch(err => {
      console.error(err);
    });
  }
}

// Setup server
let server;

before(async () => {
  server = await app();
  const url = `http://localhost:${server.address().port}/api`;
  axios.defaults.baseURL = url;
  axios.defaults.headers.post["Content-Type"] = "application/json";
});

after(() => {
  server.close();
});

// Setup DB
before(() => mongoose.connect(config.db.url));

afterEach(() => removeAllCollections());

after(async () => {
  await dropAllCollections();
  await mongoose.connection.close();
});

export {
  chai,
  sinon,
  expect,
  mongoose,
  axios
};

export default {
  chai,
  sinon,
  expect,
  mongoose,
  axios
};