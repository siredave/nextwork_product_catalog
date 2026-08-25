const express = require('express');
const upload = require('../middleware/upload');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');
const router = express.Router();



router.post('/',upload.single('image'), createProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/:id',upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;