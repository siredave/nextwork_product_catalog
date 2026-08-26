require("dotenv").config();

const cloudinary = require("cloudinary").v2;

const requiredVars = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

const missing = Object.entries(requiredVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missing.length) {
  throw new Error(
    `Missing Cloudinary environment variables: ${missing.join(", ")}`,
  );
}

cloudinary.config({
  cloud_name: requiredVars.cloud_name,
  api_key: requiredVars.api_key,
  api_secret: requiredVars.api_secret,
  secure: true,
  hide_sensitive: true,
});

module.exports = cloudinary;
