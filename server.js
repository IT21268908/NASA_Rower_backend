require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

class Server {
  static instance;

  constructor() {
    // checks if an instance of the server already exists and returns it 
    if (Server.instance) {
      return Server.instance;
    }

    this.app = express();

    // Middleware
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      console.log(req.path, req.method);
      next();
    });

    const bodyParser = require('body-parser');
    const cors = require('cors');
    this.app.use(bodyParser.json());
    this.app.use(cors());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // Routes
    this.app.use(`/api/user`, require('./routes/user/userRoutes'));
  
    this.app.use((err, _req, res, _next) => {
      const errorStatus = err.status || 500;
      const errorMessage =
        err.message || 'Something Went Wrong, Please Contact Technical Team.';
      return res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
        stack: err.stack,
      });
    });

    // Connect to DB
    mongoose
      .connect(process.env.MONGO_URI)
      .then(() => {
        // Listen to port
        this.app.listen(process.env.PORT, () => {
          console.log(
            'Connected to db & listening for requests on port',
            process.env.PORT
          );
        });
      })
      .catch((err) => {
        console.log(err);
      });

    Server.instance = this;
  }
}

const serverInstance = new Server();
module.exports = serverInstance.app;