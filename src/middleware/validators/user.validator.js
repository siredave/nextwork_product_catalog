const { body, checkExact } = require("express-validator");
const validate = require("../validate");

// Validation rules for the signup endpoint
const validateSignup = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  checkExact(),
  validate,
];

// Validation rules for the login endpoint
const validateLogin = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  checkExact(),
  validate,
];

// Only an email address is accepted by the forgot-password endpoint.
const validateForgotPassword = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  checkExact(),
  validate,
];

// Only a new password is accepted by the reset-password endpoint.
const validateResetPassword = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  checkExact(),
  validate,
];

module.exports = {
  validateSignup,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
};
