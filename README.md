# Product Catalog API

Clear, production-ready backend for a simple product catalog built with Node.js, Express, and MongoDB. This repository demonstrates a small, well-structured API with image uploads to Cloudinary, input validation, and sensible defaults so others can run, test, and extend it easily.

Table of contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [API endpoints (Postman-ready)](#api-endpoints-postman-ready)
- [Validation & error format](#validation--error-format)
- [File upload guidance](#file-upload-guidance)
- [Testing](#testing)
- [Deployment notes](#deployment-notes)
- [Contributing](#contributing)
- [License](#license)

Features
- CRUD for products (`name`, `price`, `category`, `description`)
- Image upload to Cloudinary (stored as `imageUrl` and `imagePublicId`)
- Listing with pagination, filtering, and sorting
- Input validation (`express-validator`) and consistent error payloads
- Security basics: `helmet`, CORS, rate limiting

Prerequisites
- Node.js 18+ (or compatible LTS)
- A running MongoDB instance (Atlas or self-hosted)
- Cloudinary account for image uploads (or remove upload middleware to disable images)

Quick start
1. Clone the repository and open the backend folder:

```bash
git clone <your-repo-url>
cd product-catalog-api
```

2. Install dependencies and start in development:

```bash
npm install
npm run dev
```

The app listens on `PORT` (default `5000`). Main files: [src/server.js](src/server.js#L1) and [src/app.js](src/app.js#L1).

Environment variables
Create a `.env` file in the `product-catalog-api` folder. Minimal required variables:

```env
MONGODB_URI=your-mongodb-connection-string
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
PORT=5000
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
NODE_ENV=development
```

Notes: [src/config/db.js](src/config/db.js#L1) reads `MONGODB_URI` and [src/config/cloudinary.js](src/config/cloudinary.js#L1) requires the Cloudinary keys.

Scripts
- `npm run dev` — start with `nodemon` (development)
- `npm start` — run with `node` (production)
- `npm test` — run unit tests (`node --test`)

API endpoints (Postman-ready)
Base URL: `http://localhost:5000/api/v1`

General Postman tips
- For JSON requests use `Body → raw → JSON`.
- For image uploads use `Body → form-data` and set the `image` field to type `File`.
- Replace `<PRODUCT_ID>` in examples with a real `_id` returned from list/create responses.

1) Health
- Method: `GET`
- URL: `/health`
- Postman: `GET http://localhost:5000/api/v1/health`
- Expected response (200):

```json
{ "message": "API is healthy" }
```

2) List products
- Method: `GET`
- URL: `/products`
- Query params: `category`, `sort`, `page`, `limit` (all optional)
- Example Postman request: `GET http://localhost:5000/api/v1/products?page=1&limit=5`
- Example cURL:

```bash
curl "http://localhost:5000/api/v1/products?page=1&limit=5" -H "Accept: application/json"
```
- Example response (200):

```json
{
  "success": true,
  "data": [
    {"_id":"64f9a1...","name":"Laptop","price":1299.99,"category":"electronics","imageUrl":null}
  ],
  "meta": {"total":1,"page":1,"limit":5,"pages":1}
}
```

3) Get single product
- Method: `GET`
- URL: `/products/:id`
- Postman: `GET http://localhost:5000/api/v1/products/<PRODUCT_ID>`
- Example cURL:

```bash
curl "http://localhost:5000/api/v1/products/<PRODUCT_ID>" -H "Accept: application/json"
```
- Example response (200):

```json
{ "success": true, "data": {"_id":"64f9a1...","name":"Laptop","price":1299.99,"category":"electronics","description":"A powerful laptop","imageUrl":null} }
```

4) Create product
Two Postman-ready options below.

- Option A — form-data (image upload)
  - Postman: `POST http://localhost:5000/api/v1/products` → `Body` → `form-data`
  - Add keys: `name` (Text), `price` (Text), `category` (Text), `description` (Text), `image` (File)

  - Example cURL (multipart):

```bash
curl -X POST "http://localhost:5000/api/v1/products" \
  -F "name=My Product" \
  -F "price=19.99" \
  -F "category=toys" \
  -F "description=Nice toy" \
  -F "image=@/path/to/image.jpg"
```

- Option B — raw JSON (no image)
  - Postman: `Body` → `raw` → `JSON`

```json
{
  "name": "My Product",
  "price": 19.99,
  "category": "toys",
  "description": "Nice toy"
}
```

- Example response (201):

```json
{
  "success": true,
  "data": {"_id":"6500b2...","name":"My Product","price":19.99,"category":"toys","description":"Nice toy","imageUrl":"https://res.cloudinary.com/.../image.jpg","imagePublicId":"products/abc123"}
}
```

5) Update product
- Method: `PUT`
- URL: `/products/:id`
- Option A — form-data (to replace or add image). Option B — raw JSON (fields only).

Raw JSON example (Postman `raw -> JSON`):

```json
{ "name": "Updated Name", "price": 29.99 }
```

Example cURL (JSON):

```bash
curl -X PUT "http://localhost:5000/api/v1/products/<PRODUCT_ID>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","price":29.99}'
```

Example response (200):

```json
{ "success": true, "data": {"_id":"6500b2...","name":"Updated Name","price":29.99,"category":"toys","description":"Nice toy","imageUrl":"https://res.cloudinary.com/.../image.jpg"} }
```

6) Delete product
- Method: `DELETE`
- URL: `/products/:id`
- Postman: `DELETE http://localhost:5000/api/v1/products/<PRODUCT_ID>`

Example cURL:

```bash
curl -X DELETE "http://localhost:5000/api/v1/products/<PRODUCT_ID>"
```

Example response (200):

```json
{ "success": true, "data": {"_id":"6500b2...","name":"Updated Name"} }
```

Validation & error format
- Validation errors (from `express-validator`) return 400 and payload like:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [ { "field": "name", "message": "Name is required" } ]
}
```

- Operational errors use the `AppError` class and the global handler in [src/middleware/errorHandler.js](src/middleware/errorHandler.js#L1).

File upload guidance
- Allowed types: `image/jpeg`, `image/png`, `image/webp`.
- Max file size: 5 MB. Oversize and unexpected file field errors return 400 (see [src/middleware/multerErrorMiddleware.js](src/middleware/multerErrorMiddleware.js#L1)).
- Field name for file: `image` (required by the routes' middleware).



Deployment notes
- Ensure `MONGODB_URI`, `CLOUDINARY_*` keys, and other env vars are set in your production environment.
- Tune rate limiting and CORS to match production requirements.

Contributing
- Open an issue or PR. Keep changes small and add tests for new behavior. A suggested flow:
  1. Fork the repo
  2. Create a branch `feature/describe-change`
  3. Add tests and update docs
  4. Open a PR describing the change

License
This project uses the ISC license (see `package.json`).

