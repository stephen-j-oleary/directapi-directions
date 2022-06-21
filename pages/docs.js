
import express from "express";
import expressJSDocSwagger from "express-jsdoc-swagger";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import _ from "lodash";
import { openApiSchema as clientSchema } from "../schemas/Client.js";
import { openApiSchema as userSchema } from "../schemas/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const router = express.Router();

const apiDefinition = {
  openapi: "3.0.1",
  info: {
    version: "1.0.0",
    title: "Pro Auth",
    description: "Pro Auth - OAuth 2.0 Server",
    author: "Stephen O'Leary"
  },
  servers: [ { url: '/api' } ]
};
const components = {
  schemas: {
    User: userSchema,
    Client: clientSchema,
    JsonPatch: {
      type: "array",
      items: {
        type: "object",
        description: "A JSONPatch document as defined by RFC 6902",
        properties: {
          op: {
            type: "string",
            description: "The operation to be performed",
            enum: [ "add", "remove", "replace", "move", "copy", "test" ]
          },
          path: {
            type: "string",
            description: "A JSON-Pointer"
          },
          value: {
            type: "object",
            description: "The value to be used within the operations"
          },
          from: {
            type: "string",
            description: "A string containing a JSON Pointer value"
          }
        },
        required: [ "op", "path" ]
      }
    },
    MergePatch: {
      type: "object"
    }
  },
  responses: {
    ApiError: {
      content: {
        "application/json": {
          schema: { $ref: "#/components/schemas/ApiError" }
        }
      }
    }
  },
  securitySchemes: {
    oauth2: {
      type: "oauth2",
      flows: {
        authorizationCode: {
          authorizationUrl: "/authorize",
          tokenUrl: "/token",
          scopes: {
            "directions:0": "",
            "directions:1": "",
            "directions:2": "",
            "search:0": "",
            "search:1": "",
            "search:2": "",
            "user:read": "Read user information (GET /user)",
            "user:edit": "Edit user information (PUT /user)",
            "user:delete": "Delete user (DELETE /user)"
          }
        }
      }
    },
    authorizationCode: {
      type: "oauth2",
      flows: {
        authorizationCode: {
          authorizationUrl: "/authorize",
          tokenUrl: "/token",
          scopes: {
            "directions:0": "",
            "directions:1": "",
            "directions:2": "",
            "search:0": "",
            "search:1": "",
            "search:2": "",
            "user:read": "Read user information",
            "user:edit": "Edit user information",
            "user:delete": "Delete user"
          }
        }
      }
    },
    clientCredentials: {
      type: "oauth2",
      flows: {
        clientCredentials: {
          tokenUrl: "/token",
          scopes: {
            "directions:0": "",
            "directions:1": "",
            "directions:2": "",
            "search:0": "",
            "search:1": "",
            "search:2": "",
            "user:read": "Read user information",
            "user:edit": "Edit user information",
            "user:delete": "Delete user"
          }
        }
      }
    },
    basic: {
      type: "http",
      scheme: "basic"
    }
  }
};
const security = [{
  authorizationCode: []
}];

// Generate api route documentation
const endpointSpecs = swaggerJSDoc({
  definition: apiDefinition,
  apis: [ "./api/pages/**/*.js" ],
});

// Generate api schema components
const generateComponents = () => new Promise(resolve => {
  const instance = expressJSDocSwagger(router)({
    ...apiDefinition,
    baseDir: __dirname,
    filesPattern: [ "../**/*.js" ],
    exposeSwaggerUI: false,
    notRequiredAsNullable: true
  });
  instance.on("finish", data => {
    resolve(data);
  });
});


// Api docs (found at /docs)
router.use(swaggerUiExpress.serve);
router.use(async (req, res) => {
  const componentSpecs = await generateComponents();
  res.send(swaggerUiExpress.generateHTML({ ...endpointSpecs, components: _.merge(components, componentSpecs.components), security: security }));
});


export default router;
