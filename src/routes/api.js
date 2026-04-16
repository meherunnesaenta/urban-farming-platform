const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');

// Import controllers
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { createVendorProfile, getVendorProfile, updateVendorProfile } = require('../controllers/vendorController');
const { getAllProduce, createProduce, updateProduce, getProduceById } = require('../controllers/produceController');
const { getAllRentalSpaces, createRentalSpace, getRentalSpaceById, bookRentalSpace } = require('../controllers/rentalController');
const { getAllPosts, createPost, likePost, getPostById } = require('../controllers/communityController');
const { submitCertification, verifyCertification, getVendorCertifications, getAllCertifications } = require('../controllers/certificationController');
const { getUserPlants, createPlant, updatePlantHealth, getPlantById, deletePlant } = require('../controllers/plantController');

// ==================== AUTH ROUTES ====================
router.post('/auth/register', authLimiter, register);
router.post('/auth/login', authLimiter, login);
router.get('/auth/me', protect, getMe);
router.put('/auth/profile', protect, updateProfile);

// ==================== VENDOR ROUTES ====================
router.post('/vendor/profile', protect, authorize('vendor'), createVendorProfile);
router.get('/vendor/profile', protect, authorize('vendor'), getVendorProfile);
router.put('/vendor/profile', protect, authorize('vendor'), updateVendorProfile);

// Vendor Produce Management
router.post('/vendor/produce', protect, authorize('vendor'), createProduce);
router.put('/vendor/produce/:id', protect, authorize('vendor'), updateProduce);

// Vendor Certifications
router.post('/vendor/certification', protect, authorize('vendor'), submitCertification);
router.get('/vendor/certifications', protect, authorize('vendor'), getVendorCertifications);

// Vendor Rental Spaces
router.post('/vendor/rentals', protect, authorize('vendor'), createRentalSpace);

// ==================== ADMIN ROUTES ====================
router.put('/admin/certification/:id', protect, authorize('admin'), verifyCertification);
router.get('/admin/certifications', protect, authorize('admin'), getAllCertifications);

// ==================== MARKETPLACE ROUTES ====================
router.get('/produce', apiLimiter, getAllProduce);
router.get('/produce/:id', getProduceById);

// ==================== RENTAL ROUTES ====================
router.get('/rentals', getAllRentalSpaces);
router.get('/rentals/:id', getRentalSpaceById);
router.post('/rentals/book', protect, bookRentalSpace);

// ==================== COMMUNITY ROUTES ====================
router.get('/community/posts', getAllPosts);
router.post('/community/posts', protect, createPost);
router.get('/community/posts/:id', getPostById);
router.post('/community/posts/:id/like', protect, likePost);

// ==================== PLANT TRACKING ROUTES ====================
router.get('/plants', protect, getUserPlants);
router.post('/plants', protect, createPlant);
router.get('/plants/:id', protect, getPlantById);
router.put('/plants/:id/health', protect, updatePlantHealth);
router.delete('/plants/:id', protect, deletePlant);

module.exports = router;