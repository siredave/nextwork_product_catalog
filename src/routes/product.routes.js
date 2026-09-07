const express = require("express");
const upload = require("../middleware/upload");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const {
  createProductValidator,
  updateProductValidator,
  idParamValidator,
} = require("../middleware/validators/product.validator");

const validate = require("../middleware/validate");
const { protect } = require('../middleware/auth')


const router = express.Router();

router.post(
  "/",
  createProductValidator,
  validate,
  protect,
  upload.single("image"),
  createProduct,
);
router.get("/", getAllProducts);
router.get("/:id", idParamValidator, validate, getProductById);
router.put(
  "/:id",
  idParamValidator,
  updateProductValidator,
  validate,
  protect,
  upload.single("image"),
  updateProduct,
);
router.delete("/:id", idParamValidator, validate, protect, deleteProduct);

module.exports = router;
