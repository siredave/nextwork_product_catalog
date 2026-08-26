const { body, param } = require('express-validator');

// Rules for creating a new product - all required fields must be present
const createProductValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

// Rules for updating - all fields optional, but validated if present
const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
  body('price')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .trim()
    .notEmpty().withMessage('Category cannot be empty'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
];

// Validates that the :id URL param is a valid MongoDB ObjectId
const idParamValidator = [
  param('id').isMongoId().withMessage('Invalid product ID format')
];

module.exports = {
  createProductValidator,
  updateProductValidator,
  idParamValidator
};