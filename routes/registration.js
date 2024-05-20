const express = require("express");
const bcrypt = require("bcrypt");
const { generateToken, validateJWT } = require("../utils/jwt");
const ensureOrder = require("../middleware/ensureOrder");
const User = require("../models/User");
const router = express.Router();



router.post("/register", async (req, res) => {
  const { number, password } = req.body;

  try {
    const existingUser = await User.findOne({ number });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ number, password: hashedPassword });
    await newUser.save();
    res
      .status(201)
      .json({ message: `otp sent to the number: ${number} User registered successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { number, password } = req.body;

  try {
    const user = await User.findOne({ number });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken({ number });
      req.session.user = { id: user._id, state: "loggedIn" };
      res.send({
        message: "User logged in successfully, proceed to DOB",
        token,
      });
    } else {
      res.status(400).send("Invalid number or password");
    }
  } catch (err) {
    res.status(500).send("Error logging in: " + err.message);
  }
});

router.post("/dob", validateJWT, ensureOrder("loggedIn"), async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.session.user.id, {
      dob: req.body.dob,
      state: "dobEntered",
    });
    req.session.user.state = "dobEntered";
    res.send("DOB entered, proceed to enter salary information");
  } catch (err) {
    res.status(500).send("Error entering DOB: " + err.message);
  }
});

router.post(
  "/salary",
  validateJWT,
  ensureOrder("dobEntered"),
  async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.session.user.id, {
        salary: req.body.salary,
        state: "salaryEntered",
      });
      req.session.user.state = "salaryEntered";
      res.send("Salary entered, proceed to enter address");
    } catch (err) {
      res.status(500).send("Error entering salary: " + err.message);
    }
  }
);

router.post(
  "/add",
  validateJWT,
  ensureOrder("salaryEntered"),
  async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.session.user.id, {
        address: req.body.address,
        state: "addressEntered",
      });
      req.session.user.state = "addressEntered";
      res.send("Address entered, registration is complete");
    } catch (err) {
      res.status(500).send("Error entering address: " + err.message);
    }
  }
);

router.get('/users',validateJWT,async(req,res)=>{
    try{
        const users = await User.find()
        res.send(users)
    }
    catch(err){
        res.status(500).send(err)
    }
})

router.get("/session-state", (req, res) => {
  if (req.session.user) {
    // res.json({ state: req.session.user.state });
    res.json(req.session.user);
  } else {
    res.status(400).send("No user session found");
  }
});


router.delete("/delete-user/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id); 
    if (!user) {
      return res.status(404).json({ message: "User not found" }); 
    }
    res.status(200).json({ message: "User deleted successfully", deletedUser: user }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" }); 
  }
});

module.exports = router;
