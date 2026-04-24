const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // One-time fix: drop the stale prn_1 index that blocks empty-PRN registrations
    // and clean up any empty-string prn values in existing documents
    try {
      const db = conn.connection.db;
      const usersCol = db.collection("users");
      // Remove empty-string prn so they become absent (sparse index ignores them)
      await usersCol.updateMany({ prn: "" }, { $unset: { prn: "" } });
      // Drop the old index so Mongoose can recreate it correctly
      await usersCol.dropIndex("prn_1");
      console.log("Cleaned up stale prn index");
    } catch (indexErr) {
      // Index may not exist or already be fixed – that's fine
      if (indexErr.codeName !== "IndexNotFound") {
        console.log("PRN index cleanup skipped:", indexErr.message);
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
