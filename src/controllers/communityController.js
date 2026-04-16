const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ResponseHandler = require('../utils/responseHandler');

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    
    const where = {};
    if (category) where.category = category;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.communityPost.count({ where })
    ]);
    
    ResponseHandler.paginated(res, posts, total, page, limit, 'Posts retrieved');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Create post
const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    const post = await prisma.communityPost.create({
      data: {
        userId: req.user.id,
        title,
        content,
        category: category || 'general'
      }
    });
    
    ResponseHandler.success(res, post, 'Post created successfully', 201);
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Like post
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await prisma.communityPost.update({
      where: { id },
      data: {
        likes: {
          increment: 1
        }
      }
    });
    
    ResponseHandler.success(res, post, 'Post liked successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

// Get post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await prisma.communityPost.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
    
    if (!post) {
      return ResponseHandler.error(res, 'Not found', 'Post not found', 404);
    }
    
    ResponseHandler.success(res, post, 'Post retrieved successfully');
  } catch (error) {
    ResponseHandler.error(res, 'Server error', error.message, 500);
  }
};

module.exports = { getAllPosts, createPost, likePost, getPostById };
