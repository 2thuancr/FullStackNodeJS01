const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FullStack NodeJS API',
            version: '1.0.0',
            description: 'API documentation cho FullStack NodeJS với ExpressJS + MySQL',
            contact: {
                name: 'Developer',
                email: 'dev@example.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:8888',
                description: 'Development server'
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
        }
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;




