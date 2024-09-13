import mongoose from "mongoose";

const BookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);

// Compound index for efficient querying and ensuring uniqueness
BookmarkSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const BookmarkModel = mongoose.model("Bookmark", BookmarkSchema);
