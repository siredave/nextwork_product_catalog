const productService = require('../services/product.service');

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
        next(error);    
    }
};

const getAllProducts = async(req, res, next) => {
    try {
        const products = await productService.getAllProducts();
        res.status(200).json({success: true, data: products});
    } catch (error) {
        next(error);
    }
};

const getProductById = async(req, res, next) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.status(200).json({success: true, data: product});
    } catch (error) {
        next(error);
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
    next(error);
  }
};

const deleteProduct = async(req, res, next) => {
    try {
        const product = await productService.deleteProduct(req.params.id);
        res.status(200).json({success: true, data: product});
    } catch (error) {
        next(error);
    }
};


module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
