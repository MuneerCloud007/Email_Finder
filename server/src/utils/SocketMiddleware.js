// src/middleware/socketIoMiddleware.js
const socketIoMiddleware = (io) => (req, res, next) => {
    req.io = io;
    next();
  };
  
  export default socketIoMiddleware;
  