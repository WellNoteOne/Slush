import mongoose from "mongoose";

const speakerSchema = new mongoose.Schema({
  name: String,
  img: String,
  description: String,
  bio: String,
  profileUrl: String,
});

export default mongoose.model("Speaker", speakerSchema);
