// adminMiddleware.js


// jwt middlware sets req.user after verifying token

const isAdmin = (req, res, next) => {
  // Check if user exists and role is Admin
  if (req.user && req.user.role === "admin") {
    next(); // user is admin, allow access
  } else {
    res.status(403).json({ message: "Admin access only" });
  }
};

module.exports = isAdmin;