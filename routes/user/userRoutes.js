const express = require("express");
const router = express.Router();

// import all controllers
const controller = require("../../controllers/userController");

// POST method;
router.post("/register", controller.register); // register user
router.post("/login", controller.login); //login in app
router.post("/verifyToken", controller.verifyToken); //verify the token

module.exports = router;
