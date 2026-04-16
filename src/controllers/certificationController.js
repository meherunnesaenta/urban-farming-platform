const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ResponseHandler = require('../utils/responseHandler');

// Submit certification (vendor)
const submitCertification = async (req, res) => {
  try {
    const { certifyingAgency, certificateNumber, issueDate, expiryDate } = req.body;
    
    const cert = await prisma.sustainabilityCert.create({
      data: {
        vendorId: req.user.id,
        certifyingAgency,
        certificateNumber,
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate),
        status: 'pending'
      }
    });
    
    ResponseHandler.success(res, cert, 'Certification submitted for review', 201);
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Verify certification (admin only)
const verifyCertification = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    const cert = await prisma.sustainabilityCert.update({
      where: { id },
      data: {
        status,
        rejectionReason: rejectionReason || null
      }
    });
    
    // If verified, update vendor's products
    if (status === 'verified') {
      const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { userId: cert.vendorId }
      });
      
      if (vendorProfile) {
        await prisma.produce.updateMany({
          where: { vendorId: vendorProfile.id },
          data: { certificationStatus: 'certified' }
        });
      }
    }
    
    ResponseHandler.success(res, cert, 'Certification updated successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Get vendor certifications
const getVendorCertifications = async (req, res) => {
  try {
    const certs = await prisma.sustainabilityCert.findMany({
      where: { vendorId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    ResponseHandler.success(res, certs, 'Certifications retrieved successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Get all certifications (admin)
const getAllCertifications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const where = {};
    if (status) where.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [certs, total] = await Promise.all([
      prisma.sustainabilityCert.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.sustainabilityCert.count({ where })
    ]);
    
    ResponseHandler.paginated(res, certs, total, page, limit, 'Certifications retrieved');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

module.exports = { 
  submitCertification, 
  verifyCertification, 
  getVendorCertifications,
  getAllCertifications 
};
