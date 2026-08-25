require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const productRoutes = require('./routes/product.routes')
const multerErrorMiddleware = require('./middleware/multerErrorMiddleware')
const errorHandler = require('./middleware/errorHandler')

const app = express()

// Middleware
app.use(express.json())
app.use(morgan('dev'))


app.get('/api/vi/health', (req, res) => {
  res.status(200).json({ message: 'API is healthy' })
})


app.use('/api/v1/products', productRoutes);
app.use(errorHandler);
app.use(multerErrorMiddleware);

module.exports = app