import express, { application } from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler } from './src/utils/errorHandler.js';
import emailVerifier from './src/api/emailVerfier.api.js';
import DbConnection from './src/utils/dbconnection.js';
import userApi from './src/api/user.api.js';
import folderApi from './src/api/folderData.api.js';
import socketIoMiddleware from './src/utils/SocketMiddleware.js'; // Import the middleware
import { Server } from "socket.io";
import { createServer } from "http";
import { fileURLToPath } from 'url';
import fileUploadApi from "./src/api/fileUpload.api.js";
import creditApi from './src/api/credit.api.js';
import autoWebscraping from './src/api/autoWebscraping.api.js'
import api from './src/api/emailVerfier.api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Enable Express to trust the proxy
app.set('trust proxy', true);

app.get('/test', (req, res) => {
  res.send('Server is running!');
});

DbConnection().then(() => {
  const PORT = process.env.PORT || 4000;
  // Listen on all interfaces

  server.listen(PORT,'0.0.0.0', () => {
    console.log(`Server is listening on port ${PORT}`);
  });
  


}).catch((err) => {
  console.error("There is an issue with the MongoDB connection: ", err);
  process.exit(1);
});

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


   // Check if the room exists
   const roomExists = io.sockets.adapter.rooms.has(uniqueRoom);

   if (roomExists) {
     console.log(`Room ${uniqueRoom} exists. Adding socket ${socket.id} to the room.`);
   } else {
     console.log(`Room ${uniqueRoom} does not exist. Creating and adding socket ${socket.id} to the room.`);
   }
 

  // Join the unique room
  socket.join(uniqueRoom);

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

// Route
app.use("/api/v1/user", userApi);     
app.use("/api/v1/emailVerifier", emailVerifier);  //  
app.use("/api/v1/folder", folderApi);   
app.use("/api/v1/file",fileUploadApi); 
app.use("/api/v1/credit",creditApi);
api.use("/api/v1/autoWebscraping",autoWebscraping);

// Route to emit message
app.get('/emit-message', (req, res) => {
  const message = "Hello from /emit-message route!";

  // Emit a message to all connected clients
  req.io.emit('btnLoading', message);

  res.send('Message emitted to all clients.');
});

app.use(errorHandler);


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
