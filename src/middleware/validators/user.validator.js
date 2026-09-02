const { body } = require("express-validator");
const validate = require("../validate");

// Validation rules for the signup endpoint
const validateSignup = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  validate,
];

// Validation rules for the login endpoint
const validateLogin = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

module.exports = { validateSignup, validateLogin };
