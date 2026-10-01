require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../src/models/user.model");

/**
 * Promote an existing account during controlled initial shop setup.
 * This script intentionally does not create accounts or expose role assignment over HTTP.
 */
async function promoteAdmin() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    throw new Error("Usage: npm run admin:promote -- <existing-user-email>");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured to promote an admin.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: "admin" } },
    { new: true, runValidators: true },
  ).select("name email role");

  if (!user) {
    throw new Error(`No existing account found for ${email}. Sign up first.`);
  }

  console.info(`Promoted ${user.email} to ${user.role}.`);
}

promoteAdmin()
  .catch((error) => {
    console.error(`Admin promotion failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Close the database connection so this one-off command exits cleanly.
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
