// server.js
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const server = http.createServer();

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173","https://www.sinicrita.id", "https://sinicrita.id"],
    methods: ["GET", "POST"]
  }
});

const userSocketMap = new Map();

io.on('connection', (socket) => {
  console.log('WebSocket client connected:', socket.id);

  socket.on('register', (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('offer', (data) => {
    const targetSocketId = userSocketMap.get(data.targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('offer', data);
    }
  });

  socket.on('answer', (data) => {
    const targetSocketId = userSocketMap.get(data.targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('answer', data);
    }
  });

  socket.on('candidate', (data) => {
    const targetSocketId = userSocketMap.get(data.targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('candidate', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected:', socket.id);
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} removed from mapping`);
        break;
      }
    }
  });
});

const PORT = 8081;
server.listen(PORT, () => {
  console.log(`WebSocket server running on http://localhost:${PORT}`);
});