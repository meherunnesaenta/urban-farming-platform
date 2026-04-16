const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ResponseHandler = require('../utils/responseHandler');

// Create vendor profile
const createVendorProfile = async (req, res) => {
  try {
    const { farmName, farmDescription, farmLocation } = req.body;
    
    const existingProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    });
    
    if (existingProfile) {
      return ResponseHandler.error(res, 'Profile exists', 'You already have a vendor profile', 400);
    }
    
    const profile = await prisma.vendorProfile.create({
      data: {
        userId: req.user.id,
        farmName,
        farmDescription,
        farmLocation
      }
    });
    
    ResponseHandler.success(res, profile, 'Vendor profile created successfully', 201);
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Get vendor profile
const getVendorProfile = async (req, res) => {
  try {
    const profile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    
    if (!profile) {
      return ResponseHandler.error(res, 'Not found', 'Vendor profile not found', 404);
    }
    
    ResponseHandler.success(res, profile, 'Profile retrieved successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Update vendor profile
const updateVendorProfile = async (req, res) => {
  try {
    const { farmName, farmDescription, farmLocation } = req.body;
    
    const profile = await prisma.vendorProfile.update({
      where: { userId: req.user.id },
      data: {
        farmName: farmName || undefined,
        farmDescription: farmDescription || undefined,
        farmLocation: farmLocation || undefined
      }
    });
    
    ResponseHandler.success(res, profile, 'Profile updated successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

module.exports = { createVendorProfile, getVendorProfile, updateVendorProfile };
