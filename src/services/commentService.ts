import mongoose from "mongoose";
import { CommentModel } from "../models/comments";
import {
  CreateCommentsService,
  CreateReplyService,
  DeleteCommentsParams,
  IComment,
  LikeCommentsService,
} from "../types/commentsType";
import AppError from "../utils/appError";

async function populateChildComments(comment: IComment): Promise<void> {
  await comment.populate("childComments");
  for (let childComment of comment.childComments) {
    if (childComment instanceof Document) {
      await populateChildComments(childComment as IComment);
    }
  }
}

export async function createCommentsService({
  author,
  content,
  postId,
}: CreateCommentsService) {
  const comment = new CommentModel({
    content,
    author,
    post: postId,
  });
  await comment.save();

  return { comment };
}

export async function getCommentsService(postId: string) {
  const comments = await CommentModel.find({
    post: postId,
    parentComment: null,
  })
    .populate("author", "username")
    .sort("-createdAt");

  // Fetch nested comments
  for (let comment of comments) {
    await populateChildComments(comment as IComment);
  }

  return { comments };
}

export async function toggleLikeService({
  userId,
  commentId,
}: LikeCommentsService) {
  const comment = await CommentModel.findById(commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  let isLiked = comment.likes.includes(userId);
  let updateOperation;

  if (isLiked) {
    // User has already liked the comment, so remove the like
    updateOperation = { $pull: { likes: userId } };
  } else {
    // User hasn't liked the comment yet, so add the like
    updateOperation = { $addToSet: { likes: userId } };
  }

  const updatedComment = await CommentModel.findByIdAndUpdate(
    commentId,
    updateOperation,
    { new: true }
  );

  await comment.save();

  return { likes: updatedComment?.likes.length, isLiked: !isLiked };
}

export async function deleteCommentService({
  commentId,
  userId,
}: DeleteCommentsParams) {
  const comment = await CommentModel.findById(commentId);

  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  if (comment.author.toString() !== userId.toString()) {
    throw new AppError("Not authorized to delete this comment", 403);
  }

  await CommentModel.deleteMany({ _id: { $in: comment.childComments } });
  await CommentModel.findByIdAndDelete(commentId);
}

export async function replyCommentService({
  content,
  commentId,
  userId,
}: CreateReplyService) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the parent comment exists
    const parentComment = await CommentModel.findById(commentId).session(
      session
    );
    if (!parentComment) {
      await session.abortTransaction();
      session.endSession();

      throw new AppError("Parent comment not found", 404);
    }

    // Create the new reply
    const reply = new CommentModel({
      content,
      author: userId,
      post: parentComment.post,
      parentComment: commentId,
    });

    // Save the reply
    await reply.save({ session });

    // Update the parent comment to include this reply
    await CommentModel.findByIdAndUpdate(
      commentId,
      { $addToSet: { childComments: reply._id } },
      { new: true, session }
    );

    await session.commitTransaction();

    // Populate author details before sending response
    await reply.populate("author", "username");

    return reply;
  } catch (error) {
    await session.abortTransaction();

    throw new AppError("Creating comment failed", 500);
  } finally {
    session.endSession();
  }
}
