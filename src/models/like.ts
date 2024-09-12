import mongoose, { CallbackError } from "mongoose";
import { PostModel } from "./posts";

const LikeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

LikeSchema.post("save", async function (doc, next) {
  try {
    // Increment the likesCount field in the corresponding Post document
    await PostModel.findByIdAndUpdate(doc.post, { $inc: { likesCount: 1 } });
    next();
  } catch (error) {
    next(error as CallbackError | undefined);
  }
});

LikeSchema.post("findOneAndDelete", async function (doc, next) {
  try {
    // Decrement the likesCount field in the corresponding Post document
    await PostModel.findByIdAndUpdate(doc.post, { $inc: { likesCount: -1 } });
    next();
  } catch (error) {
    next(error as CallbackError | undefined);
  }
});

export const LikeModel = mongoose.model("Like", LikeSchema);
