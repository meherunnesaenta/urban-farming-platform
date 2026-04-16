const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);
    
    // Join plant room for real-time updates
    socket.on('join-plant-room', (plantId) => {
      socket.join(`plant-${plantId}`);
      console.log(`Client joined plant room: plant-${plantId}`);
    });
    
    // Plant health update broadcast
    socket.on('plant-health-update', (data) => {
      io.to(`plant-${data.plantId}`).emit('health-updated', {
        plantId: data.plantId,
        healthStatus: data.healthStatus,
        growthStage: data.growthStage,
        timestamp: new Date()
      });
    });
    
    // Community post realtime update
    socket.on('new-community-post', (data) => {
      io.emit('post-created', data);
    });
    
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
  
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };
