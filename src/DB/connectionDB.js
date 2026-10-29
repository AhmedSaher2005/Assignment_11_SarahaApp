import { DB_URL } from "../../config/config.service.js";
import mongoose from "mongoose";

export default async function connectionDB() {
  try {
    await mongoose.connect(DB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("DB connected successfully...😍😍");
  } catch (error) {
    console.log(error, "DB connected faild...😢😢");
  }
}
