const jwt = require("jsonwebtoken");
const secretKey = "BACKEND";

function generateToken(user) {
  return jwt.sign(user, secretKey, { expiresIn: "1h" });
}

function validateJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    console.log("Authorization header missing"); 
    return res.status(401).send("Token is required.");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log("Token format invalid"); 
    return res.status(401).send("Invalid token format.");
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log("Token verification failed", err); 
      return res.status(401).send("Invalid token.");
    }
    req.user = decoded;
    next();
  });
}



module.exports = { generateToken, validateJWT };
