const jsdocSwagger = require("express-jsdoc-swagger"),
      swaggerJSDoc = require("swagger-jsdoc"),
      swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const router = require("express").Router();

const apiDefinition = {
  openapi: "3.0.1",
  info: {
    version: "1.0.0",
    title: "Plan My Trip",
    description: "Plan My Trip is an API that can be used to optimize delivery routes or any other trip with multiple stops. It optimizes the order of the stops and returns each section (leg) of the trip."
  },
  servers: [{url: process.env.API_URL}],
  components: {
    securitySchemes: {
      oAuth2: {
        type: "oauth2",
        flows: {
          clientCredentials: {
            tokenUrl: `${process.env.API_URL}/authentication/token`,
            scopes: {
              "free": "See the plans page for more information about the free tier",
              "tier1": "See the plans page for more information about tier 1",
              "tier2": "See the plans page for more information about tier 2"
            }
          }
        }
      },
      basicAuth: {
        type: "http",
        scheme: "basic"
      }
    }
  },
  security: [{
    oAuth2: []
  }]
};
const endpointSpecs = swaggerJSDoc({
  definition: apiDefinition,
  apis: ['./routes/**/*.js'],
});
const generateComponents = () => new Promise(resolve => {
  let instance = jsdocSwagger(router)({
    ...apiDefinition,
    baseDir: __dirname,
    filesPattern: '../**/*.js',
    exposeSwaggerUI: false,
    apiDocsPath: '/doc-components',
    notRequiredAsNullable: true
  });
  instance.on("finish", data => {
    resolve(data);
  });
});

/**
 * /docs
 *   get:
 *     description: The API Documentation
 */
router.use("/", swaggerUi.serve, async (req, res) => {
  let componentSpecs = await generateComponents();
  res.send(swaggerUi.generateHTML({...endpointSpecs, components: {...componentSpecs.components, ...endpointSpecs.components}}));
});

module.exports = router;