const SocketManager = require('../utils/socket');

// Middleware to add socket manager to request
const addSocketManager = (socketManager) => {
    return (req, res, next) => {
        req.socketManager = socketManager;
        next();
    };
};

module.exports = { addSocketManager };
