const jwt = require("jsonwebtoken");

exports.identifier = (req, res, next) => {
  let token;

  token = req.headers.authorization;

  if (!token) {
    return res.status(408).json({ success: false, message: "Unauthorized" });
  }
  try {
    const userToken = token.split(" ")[1];
    //console.log("Extracted token:", userToken);
    const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);
    if (jwtVerified) {
      req.user = jwtVerified;
      next();
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized: Invalid token" });
    }
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Token verification failed",
    });
  }
};
