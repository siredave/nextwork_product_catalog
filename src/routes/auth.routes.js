const express = require("express");
const {
  signup,
  login,
  logout,
  refreshAccessToken,
} = require("../controllers/auth.controller");
const {
  validateSignup,
  validateLogin,
} = require("../middleware/validators/user.validator");
const { apiLimiter } = require("../middleware/rateLimiter");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Rate limit + validate before hitting controller
router.post("/signup", apiLimiter, ...validateSignup, signup);
router.post("/login", apiLimiter, ...validateLogin, login);
router.post("/logout", protect, logout);
router.post("/refresh-token", refreshAccessToken);

module.exports = router;
