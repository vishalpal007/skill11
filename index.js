const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const matchRoutes = require('./routes/admin/match/matchRoute');
const contestRoutes = require('./routes/admin/contest/contestRoute');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*', // Allow any origin (for production use specify only the frontend domain)
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/admin/contest', contestRoutes);

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected to live match updates');

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(5000, () => {
    console.log('Server is running on port 5000');
});

module.exports = { io };