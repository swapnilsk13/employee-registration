const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require('dotenv').config()
const registrationRoutes = require("./routes/registration");

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;
  

// database connection
mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connection successful"))
  .catch((err) => console.error(err));

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "ORDER",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/", registrationRoutes);

app.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});
