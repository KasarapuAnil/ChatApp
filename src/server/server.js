const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',  // Allow React app
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }
});

// Allow CORS for regular HTTP requests
app.use(cors({
  origin: 'http://localhost:3000',  // Allow React app to connect
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// MongoDB setup with error handling
mongoose.connect('mongodb://localhost/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit the application if the connection fails
});

const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Serve static files
app.use(express.static('public'));

// Socket.IO handling for real-time communication
io.on('connection', (socket) => {
  console.log('New user connected');

  // Emit all messages when a user connects
  Message.find().then(messages => {
    socket.emit('allMessages', messages);
  });

  // Listen for sending messages from clients
  socket.on('sendMessage', (data) => {
    const newMessage = new Message(data);
    newMessage.save()
      .then(() => {
        console.log('New message saved:', newMessage); // Check if timestamp is present
        io.emit('newMessage', newMessage);
      })
      .catch((err) => {
        console.error('Error saving message:', err);
      });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Start server
server.listen(3001, () => {
  console.log('Server running on port 3001');
});
