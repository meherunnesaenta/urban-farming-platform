const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { connectDB } = require('./config/database');
const { initSocket } = require('./services/socketService');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/api');
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Swagger UI
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Urban Farming Platform API is running!',
    docs: 'http://localhost:' + (process.env.PORT || 3000) + '/api-docs',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        getMe: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/profile'
      },
      vendor: {
        createProfile: 'POST /api/vendor/profile',
        getProfile: 'GET /api/vendor/profile'
      },
      marketplace: {
        getAllProducts: 'GET /api/produce',
        getProductById: 'GET /api/produce/:id'
      }
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
});