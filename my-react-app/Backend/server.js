const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

const { Server } = require('socket.io');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();


// HTTP SERVER
const server = http.createServer(app);


// SOCKET SERVER
const io = new Server(server, {

  cors: {

    origin: [
      'http://localhost:5173',
      'http://localhost:3000'
    ],

    credentials: true
  }
});


// SOCKET CONNECTION
io.on('connection', (socket) => {

  console.log('User Connected');


  // JOIN PRIVATE ROOM
  socket.on('joinUserRoom', (userId) => {

    socket.join(userId);

    console.log(`Joined Room: ${userId}`);
  });


  socket.on('disconnect', () => {

    console.log('User Disconnected');
  });
});


// GLOBAL SOCKET
app.set('io', io);


app.use(cors({

  origin: [
    'http://localhost:5173',
    'http://localhost:3000'
  ],

  credentials: true
}));


app.use(express.json());


// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);


// HEALTH ROUTE
app.get('/api/health', (req, res) => {

  res.json({
    status: 'OK'
  });
});


// ERROR HANDLER
app.use((err, req, res, next) => {

  console.log(err);

  res.status(500).json({
    message: 'Server error'
  });
});


const PORT = process.env.PORT || 5000;


// DATABASE
mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log('MongoDB connected');

    server.listen(PORT, () => {

      console.log(`Server running on port ${PORT}`);
    });
  })

  .catch((err) => {

    console.log(err);
  });