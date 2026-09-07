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
const { protect } = require("../middleware/auth");

const router = express.Router();

// Validate before hitting controller; the API-wide limiter is applied in app.js.
router.post("/signup", ...validateSignup, signup);
router.post("/login", ...validateLogin, login);
router.post("/logout", protect, logout);
router.post("/refresh-token", refreshAccessToken);

module.exports = router;
