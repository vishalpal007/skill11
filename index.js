const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

const matchRoutes = require('./routes/admin/match/matchRoute');
const contestRoutes = require('./routes/admin/contest/contestRoute');

// Database connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*", // Consider narrowing this to specific frontend domains in production.
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/admin/contest', contestRoutes);

// Handle Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected to live match updates');

    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Handle example live events here
    socket.on('subscribeToLiveUpdates', (data) => {
        console.log('Subscription received for live updates:', data);
        // Logic to handle live updates here
    });
});

// Server listening
server.listen(5000, () => {
    console.log('Server is running on port 5000');
});

module.exports = { io };
