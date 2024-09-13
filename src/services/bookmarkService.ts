import mongoose from "mongoose";
import {
  createBookmarkService,
  DeleteBookmarkService,
  getUserBookmarksServiceProps,
} from "../types/bookmarkTypes";
import { BookmarkModel } from "../models/bookmark";
import AppError from "../utils/appError";
import { PostModel } from "../models/posts";

export async function bookmarkService({
  postId,
  userId,
}: createBookmarkService) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the bookmark already exists
    const existingBookmark = await BookmarkModel.findOne({
      userId,
      postId,
    }).session(session);
    if (existingBookmark) {
      throw new AppError("Post already bookmarked", 404);
    }

    // Create new bookmark
    const bookmark = new BookmarkModel({ userId, postId });
    await bookmark.save({ session });

    // Update post's bookmark count
    await PostModel.findByIdAndUpdate(
      postId,
      { $inc: { bookmarkCount: 1 } },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

export async function getUserBookmarksService({
  userId,
}: getUserBookmarksServiceProps) {
  const bookmarks = await BookmarkModel.find({ userId }).populate("postId");

  return bookmarks;
}

export async function deleteBookmarkService({
  userId,
  bookmarkId,
}: DeleteBookmarkService) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bookmark = await BookmarkModel.findOneAndDelete({
      _id: bookmarkId,
      userId,
    }).session(session);

    if (!bookmark) {
      await session.abortTransaction();
      throw new AppError("Bookmark not found", 404);
    }

    await PostModel.findByIdAndUpdate(
      bookmark.postId,
      { $inc: { bookmarkCount: -1 } },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
}
