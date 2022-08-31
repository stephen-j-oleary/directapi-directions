
import * as Yup from "yup";
import { expect } from "../initialize.test.js";
import Token from "../../helpers/Token.js";

const SAMPLE_TOKEN_DEFAULTS = {
  issuer: "sample-issuer",
  expiresIn: 120,
  algorithm: "RS256",
  privateKey: "-----BEGIN RSA PRIVATE KEY-----\nMIIBOQIBAAJBAMgqg36tmxBSH0d2ec8PSIZQ6323ss+SWsN38NEBpVWbujj8P6gI\nmr//9RVWwlQvuRFkkFLIj/8Lh8/iYu+QbPsCAwEAAQJAOCodrWzfBqxUVIP818mt\nCusnuKXTyYSCbTh5XNv+XU+O3qQ0NukvmWvXaLfyKbuH1jl7Rt5IjYwYP74Py9Gq\nkQIhAOO7zc7D9MNhDqG/oWZlARX1tKHzLwib5M2GXtkzaZopAiEA4QLBgh+9KOZd\nFEqCviBND7K+WMFx+O6tFet8DgR3eoMCIEc0Mi5C8KWiFBwYuZM1Y3iFQXwdeAg+\nDfUA3WkV/R+5AiA6kcATAfX4BnamCHsdyESm2G0Jp1jmZiIxuXkyIOGExwIgDjmI\nLAkTu5f6D22C+rwS3vTgrg0ksGfOL69BuItLqYM=\n-----END RSA PRIVATE KEY-----",
  publicKey: "-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMgqg36tmxBSH0d2ec8PSIZQ6323ss+S\nWsN38NEBpVWbujj8P6gImr//9RVWwlQvuRFkkFLIj/8Lh8/iYu+QbPsCAwEAAQ==\n-----END PUBLIC KEY-----"
};

describe("function Token", () => {
  let tokenInstance;

  beforeEach(() => {
    tokenInstance = Token(SAMPLE_TOKEN_DEFAULTS);
  });


  describe("method generate", () => {
    it("should throw if invalid argument is sent", () => {
      const result = () => tokenInstance.generate();

      return expect(result).to.throw(TypeError, "Invalid argument");
    });

    it("should return with an object of the expected format", () => {
      const result = tokenInstance.generate({ client_id: "client_id", user_id: "user_id", scope: "client:read client:write" });

      return expect(result).to.be.an("object").and.to.have.keys("token", "expiresIn");
    });
  });


  describe("method validate", () => {
    let validToken, expiredToken;

    beforeEach(() => {
      validToken = tokenInstance.generate({ client_id: "client_id", user_id: "user_id", scope: "directions:0 search:0" }).token;
      expiredToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImY0YmRkOGQzLWY3MmQtNWU3YS1iN2IxLTE4YjQxMDE2YWE0YyIsInNjb3BlIjoic2VhcmNoOmZyZWUgZGlyZWN0aW9uczpmcmVlIiwiaWF0IjoxNjMzMzc3Mjk0LCJleHAiOjE2MzMzNzczODAsImlzcyI6InBsYW4tbXktdHJpcC1hcGkifQ.F44dtRdExI1IiR41Dn4bR2Dj4ryXq0lVk9Ql_ZixahKGouOP8Og50n19qPFV8bUQv3ZdDuszlABcaSVHE-EiwFsJLNEKqMAMKfJcQcmscJVPiFuHh0uQYxYIgErEKk0vdYWwmMJwAZxBVKfbVRnmrIXAQsXiUbSHRCKq-w7vLsA";
    });

    it("should return false if invalid argument is sent", () => {
      const result = tokenInstance.validate();

      return expect(result).to.be.false;
    });

    it("should return false if an invalid JWT is sent", () => {
      const result = tokenInstance.validate("InvalidToken");

      return expect(result).to.be.false;
    });

    it("should return false if an expired JWT is sent", () => {
      const result = tokenInstance.validate(expiredToken);

      return expect(result).to.be.false;
    });

    it("should return true if a valid JWT is sent", () => {
      const result = tokenInstance.validate(validToken);

      return expect(result).to.be.true;
    });

    it("should return with a boolean", () => {
      const result = tokenInstance.validate(validToken);

      return expect(result).to.be.a("boolean");
    });
  });


  describe("method validatePayload", () => {
    let token;
    const passingSchema = Yup.object().shape({
      client_id: Yup.string().required()
    });
    const failingSchema = Yup.object().shape({
      client: Yup.string().required()
    });

    beforeEach(() => {
      token = tokenInstance.generate({ client_id: "client_id", user_id: "user_id", scope: "client:read client:write" }).token;
    });

    it("should throw if invalid argument is sent", () => {
      const result = () => tokenInstance.validatePayload();

      return expect(result).to.throw(TypeError, "Invalid argument");
    });

    it("should return false if payload fails schema validation", () => {
      const response = tokenInstance.validatePayload(token, failingSchema);

      return expect(response).to.be.false;
    });

    it("should return true if payload passes schema validation", () => {
      const response = tokenInstance.validatePayload(token, passingSchema);

      return expect(response).to.be.true;
    });
  });


  describe("method read", () => {
    const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRfaWQiOiJjbGllbnRfaWQiLCJ1c2VyX2lkIjoidXNlcl9pZCIsInNjb3BlIjoiZGlyZWN0aW9uczowIHNlYXJjaDowIiwiaWF0IjoxNjQyMTA4NTk0LCJleHAiOjE2NDIxOTQ5OTQsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTAwMCJ9.KrC7Q-RW_wNnTbc_hpQ3JKMVo5-2KeAOxM0W9OEIqdUUt8VhpUVVprWyMAxTobi0b-8qgu-gtnHOUnamJaC9Tq8RHejAvljqM6WFWhH5troLxEcz8sY5MMd76-C2x5XhW-jaAuahqjv4n4zFapb08EWNgLoIvCKFAZHPxNqEsaA";
    const invalidToken = "abc";

    it("should throw if invalid argument is sent", () => {
      const result = () => tokenInstance.read();

      return expect(result).to.throw(TypeError, "Invalid argument");
    });

    it("should throw if invalid token is sent", () => {
      const result = () => tokenInstance.read(invalidToken);

      return expect(result).to.throw(Error, "Invalid token");
    });

    it("should return an object", () => {
      const result = tokenInstance.read(token);

      return expect(result).to.be.an("object");
    });
  });
});