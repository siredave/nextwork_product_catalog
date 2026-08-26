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

const router = express.Router();

router.post(
  "/",
  createProductValidator,
  validate,
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
  upload.single("image"),
  updateProduct,
);
router.delete("/:id", idParamValidator, validate, deleteProduct);

module.exports = router;
