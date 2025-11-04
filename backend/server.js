const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const http = require('http'); 
const { Server } = require("socket.io"); 

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app); 

// --- Socket.IO Server Configuration (CRITICAL: Fixed CORS) ---
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for stable local testing
    methods: ["GET", "POST", "PUT"]
  }
});

// CRITICAL STEP: Attach io to the app instance for route access
app.set('io', io); 

// --- ROUTE DECLARATIONS ---
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// --- ROUTE MIDDLEWARE USAGE ---
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// --- SOCKET.IO LISTENERS (Real-Time Chat & Orders) ---
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  // 1. Listener for incoming chat messages (from Reseller/Admin)
  socket.on('sendMessage', (msg) => {
    console.log(`[CHAT RECEIVED] From: ${msg.userEmail}, Role: ${msg.senderRole}`);
    
    // 2. Broadcast the message to ALL connected clients
    io.emit('receiveMessage', msg); 
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// --- SERVER START ---
app.get('/', (req, res) => res.send('API is running...'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // Listen on the HTTP server, not just the Express app
    server.listen(process.env.PORT, () =>
      console.log('✅ Server running on port', process.env.PORT)
    );
  })
  .catch(err => console.error('❌ MongoDB error:', err));