"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.swaggerSpec = void 0;
var _swaggerJsdoc = _interopRequireDefault(require("swagger-jsdoc"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Garage Billing API',
      version: '1.0.0',
      description: 'API Documentation for Garage Billing Application'
    },
    servers: [
      {
        url: 'https://vicky-garage.heavenwebtechnologies.com',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Local server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/docs/*.js'] // Path to the API docs
};
const swaggerSpec = exports.swaggerSpec = (0, _swaggerJsdoc.default)(options);