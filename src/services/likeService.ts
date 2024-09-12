import { LikeModel } from "../models/like";
import { PostModel } from "../models/posts";
import { LikeTypesProps } from "../types/likeTypes";
import AppError from "../utils/appError";

export async function toggleLikeService({ postId, userId }: LikeTypesProps) {
  // Check if the post exists
  const post = await PostModel.findById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  // Check if the user has already liked the post
  const existingLike = await LikeModel.findOne({ user: userId, post: postId });

  if (existingLike) {
    // User has already liked the post, so we'll remove the like
    await LikeModel.findByIdAndDelete(existingLike._id);
    return {
      liked: false,
      likesCount: await LikeModel.countDocuments({ post: postId }),
    };
  } else {
    // User has not liked the post, so we'll create a new like
    await LikeModel.create({ user: userId, post: postId });
    return {
      liked: true,
      likesCount: await LikeModel.countDocuments({ post: postId }),
    };
  }
}
