const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Urban Farming Platform API',
      version: '1.0.0',
      description: 'Comprehensive API documentation for Interactive Urban Farming Platform',
      contact: {
        name: 'Urban Farming Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.urbanfarming.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'vendor', 'customer'] },
            status: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Produce: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            vendorId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            category: { type: 'string' },
            availableQuantity: { type: 'number' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/api.js']
};

module.exports = swaggerJsdoc(options);
