const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {
    let token;

    // Check if the request contains an authorization header with a Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Extract the token from the header
      token = req.headers.authorization.split(" ")[1];
    }

    // console.log("token", token);
    // If no token is found
    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token" });
    }

    // Verify the token
    const decoded = jwt.verify(token, 'your_secret_key');

    //userId 
    req.user = decoded.userId;

    // Move to the next middleware
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized - error" });
  }
};

module.exports = {
  protect
};