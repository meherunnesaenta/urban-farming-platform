const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ResponseHandler = require('../utils/responseHandler');

// Get all products with pagination
const getAllProduce = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, minPrice, maxPrice } = req.query;
    
    const where = { isAvailable: true };
    if (category) where.category = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      prisma.produce.findMany({
        where,
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
      prisma.produce.count({ where })
    ]);
    
    ResponseHandler.paginated(res, products, total, page, limit, 'Products retrieved');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Create product (vendor only)
const createProduce = async (req, res) => {
  try {
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!vendorProfile) {
      return ResponseHandler.error(res, 'No vendor profile', 'Please create vendor profile first', 400);
    }
    
    // Check if vendor has certification
    const hasCert = await prisma.sustainabilityCert.findFirst({
      where: {
        vendorId: req.user.id,
        status: 'verified',
        expiryDate: { gt: new Date() }
      }
    });
    
    const product = await prisma.produce.create({
      data: {
        ...req.body,
        vendorId: vendorProfile.id,
        certificationStatus: hasCert ? 'certified' : 'pending'
      }
    });
    
    ResponseHandler.success(res, product, 'Product created successfully', 201);
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Update product
const updateProduce = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: req.user.id }
    });
    
    if (!vendorProfile) {
      return ResponseHandler.error(res, 'Forbidden', 'Not authorized', 403);
    }
    
    const product = await prisma.produce.update({
      where: { id },
      data: req.body
    });
    
    ResponseHandler.success(res, product, 'Product updated successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Get single product
const getProduceById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.produce.findUnique({
      where: { id },
      include: {
        vendor: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });
    
    if (!product) {
      return ResponseHandler.error(res, 'Not found', 'Product not found', 404);
    }
    
    ResponseHandler.success(res, product, 'Product retrieved successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

module.exports = { getAllProduce, createProduce, updateProduce, getProduceById };
