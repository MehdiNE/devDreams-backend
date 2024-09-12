import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  thumbnail: { type: String },
  readingTime: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now(), required: true },
  estimatedReadingTime: Number,
  likesCount: {
    type: Number,
    default: 0,
  },
  tags: [
    {
      type: String,
    },
  ],
});

PostSchema.pre("find", function (next) {
  this.populate("author");

  next();
});

export const PostModel = mongoose.model("Post", PostSchema);
