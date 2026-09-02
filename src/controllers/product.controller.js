const productService = require('../services/product.service');

const handleControllerError = (error, res, next) => {
  if (typeof next === "function") {
    return next(error);
  }

  const statusCode = error?.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: error?.message || "Internal server error",
  });
};

const createProduct = async(req, res, next) => {
    try {
        const data = {...req.body}

        if(req.file){
            data.imageUrl = req.file.path;
            data.imagePublicId = req.file.filename
        }

        const product = await productService.createProduct(data);
        res.status(201).json({success: true, data: product});
    } catch (error) {
        handleControllerError(error, res, next);
    }
};

const getAllProducts = async(req, res, next) => {
    try {
        const result = await productService.getAllProducts(req.query);
        res.status(200).json({
            success: true,
            data: result.products,
            meta: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                pages: result.pages,
            },
        });
    } catch (error) {
        handleControllerError(error, res, next);
    }
};

const getProductById = async(req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.status(200).json({success: true, data: product});
    } catch (error) {
        handleControllerError(error, res, next);
    }
};

const updateProduct = async(req, res, next) => {
    try {
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = req.file.path;
      data.imagePublicId = req.file.filename;
    }
    
    const product = await productService.updateProduct(
      req.params.id,
      data
    );

    res.json({ success: true, data: product });
  } catch (error) {
    handleControllerError(error, res, next);
  }
};

const deleteProduct = async(req, res, next) => {
    try {
        const product = await productService.deleteProduct(req.params.id);
        res.status(200).json({success: true, data: product});
    } catch (error) {
        handleControllerError(error, res, next);
    }
};


module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
