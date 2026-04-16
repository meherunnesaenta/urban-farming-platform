# Urban Farming Platform - API Documentation

## Quick Start

### Installation
```bash
npm install
```

### Environment Setup
```bash
# Create .env file with:
DATABASE_URL="postgresql://user:password@localhost:5432/urban_farming"
JWT_SECRET="your-secret-key"
JWT_EXPIRE="7d"
PORT=3000
```

### Database Setup
```bash
# Run migrations
npx prisma migrate dev --name init

# Seed database
npm run seed
```

### Start Server
```bash
# Development
npm run dev

# Production
npm start
```

Server will be available at: `http://localhost:3000`

API Docs: `http://localhost:3000/api-docs`

---

## Authentication

### JWT Token
All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "User Name",
      "email": "user@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "securepassword",
  "role": "customer"
}
```

---

## API Endpoints

### 📦 Products (Marketplace)

#### List Products
```bash
GET /api/produce?page=1&limit=20&category=vegetables&minPrice=50&maxPrice=200
```

Query Parameters:
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 20
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter

Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "hasMore": true
  }
}
```

#### Get Single Product
```bash
GET /api/produce/:id
```

#### Create Product (Vendor Only)
```bash
POST /api/vendor/produce
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Organic Tomatoes",
  "description": "Fresh organic tomatoes",
  "price": 150.00,
  "category": "vegetables",
  "availableQuantity": 50
}
```

#### Update Product (Vendor Only)
```bash
PUT /api/vendor/produce/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 160.00,
  "availableQuantity": 45
}
```

---

### 🏡 Vendor Profile

#### Create Vendor Profile (Vendor Only)
```bash
POST /api/vendor/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "farmName": "Green Valley Farm",
  "farmDescription": "Sustainable urban farm",
  "farmLocation": {
    "type": "Point",
    "coordinates": [40.7128, -74.0060]
  }
}
```

#### Get Vendor Profile (Vendor Only)
```bash
GET /api/vendor/profile
Authorization: Bearer <token>
```

#### Update Vendor Profile (Vendor Only)
```bash
PUT /api/vendor/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "farmName": "Updated Farm Name",
  "farmDescription": "Updated description"
}
```

---

### 🌾 Rental Spaces

#### List Rental Spaces
```bash
GET /api/rentals?page=1&limit=20
```

#### Get Single Rental Space
```bash
GET /api/rentals/:id
```

#### Create Rental Space (Vendor Only)
```bash
POST /api/vendor/rentals
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Garden Plot A",
  "size": 50,
  "price": 250,
  "location": {
    "type": "Point",
    "coordinates": [40.7128, -74.0060]
  }
}
```

---

### 🌱 Plant Tracking

#### List User Plants (Protected)
```bash
GET /api/plants
Authorization: Bearer <token>
```

#### Create Plant
```bash
POST /api/plants
Authorization: Bearer <token>
Content-Type: application/json

{
  "plantName": "Tomato Plant",
  "plantType": "vegetable",
  "plantingDate": "2026-04-01",
  "expectedHarvestDate": "2026-06-01"
}
```

#### Update Plant Health
```bash
PUT /api/plants/:id/health
Authorization: Bearer <token>
Content-Type: application/json

{
  "healthStatus": "excellent",
  "growthStage": "fruiting"
}
```

#### Get Plant Details
```bash
GET /api/plants/:id
Authorization: Bearer <token>
```

#### Delete Plant
```bash
DELETE /api/plants/:id
Authorization: Bearer <token>
```

---

### 💬 Community Forum

#### List Posts
```bash
GET /api/community/posts?page=1&limit=20&category=gardening_tips
```

#### Get Single Post
```bash
GET /api/community/posts/:id
```

#### Create Post (Protected)
```bash
POST /api/community/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Tips for Urban Gardening",
  "content": "Here are my tips for successful urban gardening...",
  "category": "gardening_tips"
}
```

#### Like Post (Protected)
```bash
POST /api/community/posts/:id/like
Authorization: Bearer <token>
```

---

### 📜 Sustainability Certifications

#### Submit Certification (Vendor Only)
```bash
POST /api/vendor/certification
Authorization: Bearer <token>
Content-Type: application/json

{
  "certifyingAgency": "USDA_Organic",
  "certificateNumber": "CERT-12345",
  "issueDate": "2026-01-01",
  "expiryDate": "2027-01-01"
}
```

#### Get Vendor Certifications (Vendor Only)
```bash
GET /api/vendor/certifications
Authorization: Bearer <token>
```

#### Verify Certification (Admin Only)
```bash
PUT /api/admin/certification/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "verified",
  "rejectionReason": null
}
```

#### Get All Certifications (Admin Only)
```bash
GET /api/admin/certifications?page=1&limit=20&status=pending
Authorization: Bearer <token>
```

---

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human readable message",
  "timestamp": "2026-04-16T10:30:00.000Z"
}
```

### Common Error Codes

| Code | Error | Meaning |
|------|-------|---------|
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Not authorized for this resource |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Auth (login/register) | 5 requests | 15 minutes |
| General API | 100 requests | 1 minute |
| Strict (admin) | 10 requests | 15 minutes |

Response headers include:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 98
X-RateLimit-Reset: 1650195000
```

---

## Real-time Features (Socket.io)

### Connect to Socket Server
```javascript
const socket = io('http://localhost:3000');

// Join plant room for updates
socket.emit('join-plant-room', 'plant-uuid');

// Listen for health updates
socket.on('health-updated', (data) => {
  console.log('Plant health updated:', data);
});

// Emit plant health update
socket.emit('plant-health-update', {
  plantId: 'uuid',
  healthStatus: 'excellent',
  growthStage: 'fruiting'
});
```

---

## Database Schema

### User
- id (UUID)
- name (String)
- email (String, unique)
- password (String, hashed)
- role (enum: admin, vendor, customer)
- status (enum: active, inactive)
- createdAt, updatedAt

### VendorProfile
- id (UUID)
- userId (Foreign Key → User)
- farmName, farmDescription
- certificationStatus, rating
- farmLocation (GeoJSON)

### Produce
- id (UUID)
- vendorId (Foreign Key → VendorProfile)
- name, description, price
- category, certificationStatus
- availableQuantity, isAvailable

### PlantTracking
- id (UUID)
- userId (Foreign Key → User)
- plantName, plantType
- plantingDate, expectedHarvestDate
- healthStatus, growthStage

---

## Test Credentials

```
Admin:
  Email: admin@example.com
  Password: admin123

Vendor:
  Email: vendor1@example.com
  Password: vendor123

Customer:
  Email: customer1@example.com
  Password: customer123
```

---

## Troubleshooting

### Database Connection Error
```
Error: ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct in .env

### JWT Token Expired
```
Error: Invalid token
```
**Solution**: Generate new token by logging in again

### Rate Limit Exceeded
```
Error: Too many requests, please try again later
```
**Solution**: Wait for the rate limit window to reset (check X-RateLimit-Reset header)

---

## Support & Documentation

- **API Docs**: http://localhost:3000/api-docs
- **Performance Report**: See BENCHMARK_REPORT.md
- **Strategy Guide**: See API_STRATEGY.md

---

**Last Updated**: April 16, 2026
