import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler } from './src/utils/errorHandler.js';
import DbConnection from './src/utils/dbconnection.js';
import userApi from './src/api/user.api.js';
import socketIoMiddleware from './src/utils/SocketMiddleware.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import fileUploadApi from './src/api/fileUpload.api.js';
import creditApi from './src/api/credit.api.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Set a custom timeout value (in milliseconds)
server.setTimeout(3600000); // 1 hour in milliseconds

// Middleware setup
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// // Serve static files only in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'public')));

//   // Serve frontend application
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
//   });
// }

app.get('/test', (req, res) => {
  res.send('Server is running!');
});

const startServer = async () => {
  try {
    await DbConnection();
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('There is an issue with the MongoDB connection: ', err);
    process.exit(1);
  }
};

startServer();


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  const ip = socket.request.headers['x-forwarded-for'] || socket.handshake.address;
  const uniqueRoom = `${ip}`; // Create a unique room identifier

  console.log(`New connection: IP = ${ip}`);
  console.log('New client connected:', socket.id);



  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', reason);
    socket.leave(uniqueRoom);

  });

  socket.on('messageFromClient', ({ data, name, socketId }) => {
    console.log(name);
    console.log(data);
    console.log(socketId);
    io.emit("btnLoading", {message:"THE BTN LOADING !!!"});
  });
});

// Use the middleware to attach `io` to the `req` object
app.use(socketIoMiddleware(io));





// API routes
app.use('/api/v1/user', userApi);
app.use('/api/v1/file', fileUploadApi);   ////  ""
app.use('/api/v1/credit', creditApi);

// Route to emit message
app.get('/emit-message', (req, res) => {
  const message = 'Hello from /emit-message route!';

  // Emit a message to all connected clients
  req.io.emit('btnLoading', message);

  res.send('Message emitted to all clients.');
});

// Error handling middleware
app.use(errorHandler);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).send('Something broke!');
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
