const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ResponseHandler = require('../utils/responseHandler');

// Get all rental spaces with pagination
const getAllRentalSpaces = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [spaces, total] = await Promise.all([
      prisma.rentalSpace.findMany({
        where: { isAvailable: true },
        include: {
          vendor: {
            include: {
              user: { select: { name: true, email: true } }
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.rentalSpace.count({ where: { isAvailable: true } })
    ]);
    
    ResponseHandler.paginated(res, spaces, total, page, limit, 'Rental spaces retrieved');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Create rental space (vendor only)
const createRentalSpace = async (req, res) => {
  try {
    const { name, location, size, price } = req.body;
    
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!vendorProfile) {
      return ResponseHandler.error(res, 'No vendor profile', 'Please create vendor profile first', 400);
    }
    
    const space = await prisma.rentalSpace.create({
      data: {
        vendorId: vendorProfile.id,
        name,
        location,
        size,
        price,
        isAvailable: true
      }
    });
    
    ResponseHandler.success(res, space, 'Rental space created successfully', 201);
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Get rental space by ID
const getRentalSpaceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const space = await prisma.rentalSpace.findUnique({
      where: { id },
      include: {
        vendor: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });
    
    if (!space) {
      return ResponseHandler.error(res, 'Not found', 'Rental space not found', 404);
    }
    
    ResponseHandler.success(res, space, 'Rental space retrieved successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Book a rental space
const bookRentalSpace = async (req, res) => {
  try {
    const { rentalSpaceId, startDate, endDate } = req.body;
    
    const rentalSpace = await prisma.rentalSpace.findUnique({
      where: { id: rentalSpaceId }
    });
    
    if (!rentalSpace) {
      return res.status(404).json({ 
        success: false, 
        message: 'Rental space not found' 
      });
    }
    
    if (!rentalSpace.isAvailable) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rental space is not available' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Space booked successfully',
      data: { 
        rentalSpaceId, 
        startDate, 
        endDate, 
        totalPrice: rentalSpace.price 
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { getAllRentalSpaces, createRentalSpace, getRentalSpaceById, bookRentalSpace };

