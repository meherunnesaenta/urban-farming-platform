const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ResponseHandler = require('../utils/responseHandler');

// Get user's plants
const getUserPlants = async (req, res) => {
  try {
    const plants = await prisma.plantTracking.findMany({
      where: { userId: req.user.id },
      orderBy: { plantingDate: 'desc' }
    });
    
    ResponseHandler.success(res, plants, 'Plants retrieved successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Create plant tracking
const createPlant = async (req, res) => {
  try {
    const { plantName, plantType, plantingDate, expectedHarvestDate } = req.body;
    
    const plant = await prisma.plantTracking.create({
      data: {
        userId: req.user.id,
        plantName,
        plantType,
        plantingDate: new Date(plantingDate),
        expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null
      }
    });
    
    ResponseHandler.success(res, plant, 'Plant added successfully', 201);
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Update plant health (real-time)
const updatePlantHealth = async (req, res) => {
  try {
    const { id } = req.params;
    const { healthStatus, growthStage } = req.body;
    
    const plant = await prisma.plantTracking.update({
      where: { id },
      data: {
        healthStatus: healthStatus || undefined,
        growthStage: growthStage || undefined,
        updatedAt: new Date()
      }
    });
    
    ResponseHandler.success(res, plant, 'Plant health updated');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Get plant by ID
const getPlantById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plant = await prisma.plantTracking.findUnique({
      where: { id }
    });
    
    if (!plant) {
      return ResponseHandler.error(res, 'Not found', 'Plant not found', 404);
    }
    
    if (plant.userId !== req.user.id) {
      return ResponseHandler.error(res, 'Forbidden', 'Not authorized', 403);
    }
    
    ResponseHandler.success(res, plant, 'Plant retrieved successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Delete plant
const deletePlant = async (req, res) => {
  try {
    const { id } = req.params;
    
    const plant = await prisma.plantTracking.findUnique({
      where: { id }
    });
    
    if (!plant) {
      return ResponseHandler.error(res, 'Not found', 'Plant not found', 404);
    }
    
    if (plant.userId !== req.user.id) {
      return ResponseHandler.error(res, 'Forbidden', 'Not authorized', 403);
    }
    
    await prisma.plantTracking.delete({
      where: { id }
    });
    
    ResponseHandler.success(res, null, 'Plant deleted successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

module.exports = { getUserPlants, createPlant, updatePlantHealth, getPlantById, deletePlant };
