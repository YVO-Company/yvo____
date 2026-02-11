import mongoose from "mongoose";

export default async function connectDb() {
  if (String(process.env.SKIP_DB || "").toLowerCase() === "true") {
    console.log("Skipping MongoDB connection (SKIP_DB=true)");
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing in .env");

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { autoIndex: true });
  console.log("MongoDB connected ✅");
}
