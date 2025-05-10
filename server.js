const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

const activeUsers = new Map();

const updateUserList = () => {
  const userList = Array.from(activeUsers.entries()).map(([socketId, username]) => ({ 
    socketId, 
    username 
  }));
  io.emit("user-list-updated", userList);
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register-user', (username) => {
    activeUsers.set(socket.id, username);
    console.log(`User registered: ${username} (${socket.id})`);
    updateUserList();
    
    io.emit('message', {
      text: `${username} joined the chat`,
      username: 'System',
      timestamp: new Date().toISOString(),
      type: 'system'
    });
  });

  socket.on('message', (message) => {
    if (message.text && message.text.trim() !== '') {
      io.emit('message', {
        ...message,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('disconnect', () => {
    if (activeUsers.has(socket.id)) {
      const username = activeUsers.get(socket.id);
      activeUsers.delete(socket.id);
      updateUserList();
      io.emit('message', {
        text: `${username} left the chat`,
        username: 'System',
        timestamp: new Date().toISOString(),
        type: 'system'
      });
    }
  });
});

// Serve frontend (Vite build)
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Important fallback route for SPA (serves index.html for any route)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
