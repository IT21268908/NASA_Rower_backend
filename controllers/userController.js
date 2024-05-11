const customerModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../util");


const verifyToken = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        res.status(401).send({ message: "Invalid Token" });
      } else {
        req.user = decode;
        res.status(200).send({ message: "Token verified" });
      }
    });
  } else {
    res.status(401).send({ message: "No Token" });
  }
};

// register the user according to their type
const register = async (req, res, next) => {
  try {
    console.log(`called register`);
    const { password, email } = req.body;
    console.log(req.body);
    if (!password || !email) {
      const error = new Error("Please enter all the fields.");
      error.status = 400;
      throw error;
    }

    // Check if the user already exists in the database
    const existingUser = await customerModel.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists.");
      error.status = 400;
      throw error;
    }
    const user = new customerModel({
      email,
      password: bcrypt.hashSync(password),
    });
    await user.save();
    res.status(200).send({
      message: "User registered successfully.",
      details: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

//login in the user to the system
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await customerModel.findOne({ email });
    if (!user) {
      const error = new Error("Incorrect username or password.");
      error.status = 404;
      throw error;
    }
    //checks whether the provided password matches the hashed password stored in the database 
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      const error = new Error("Incorrect username or password.");
      error.status = 400;
      throw error;
    }

    //create JWT token
    const token = generateToken(user);

    return res.status(200).send({
      message: "Login successful.",
      details: {
        name: user.name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyToken,
};
