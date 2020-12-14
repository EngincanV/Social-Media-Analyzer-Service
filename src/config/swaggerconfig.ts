const path = require("path");

module.exports = {
    swaggerDefinition: {
        info: {
            description: 'Social Media Analyzer - API Documentation',
            title: 'Social Media Analyzer',
            version: '1.0.0',
        },
        host: 'localhost:3000',
        basePath: '/v1',
        produces: [
            "application/json"
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: "",
            }
        }
    },
    basedir: path.resolve("./"), //root directory
    files: ['./routes/*.ts']
  };