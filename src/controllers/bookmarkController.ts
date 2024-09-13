import { Request, Response } from "express";
import {
  createBookmarkReq,
  DeleteBookmarkParams,
} from "../types/bookmarkTypes";
import AppError from "../utils/appError";
import {
  bookmarkService,
  deleteBookmarkService,
  getUserBookmarksService,
} from "../services/bookmarkService";

export async function createBookmarkController(
  req: Request<{}, {}, createBookmarkReq>,
  res: Response
) {
  const { postId } = req.body;
  const userId = req.userId;

  if (!postId) {
    throw new AppError("postId is required", 400);
  }

  await bookmarkService({ postId, userId: userId! });

  res
    .status(201)
    .json({ status: "success", message: "Post bookmarked successfully" });
}

export async function getUserBookmarksController(req: Request, res: Response) {
  const userId = req.userId;

  const bookmarks = await getUserBookmarksService({ userId: userId! });

  res?.status(200).json({ status: "success", message: null, data: bookmarks });
}

export async function deleteBookmarkController(
  req: Request<DeleteBookmarkParams>,
  res: Response
) {
  const userId = req.userId;
  const bookmarkId = req.params.id;

  await deleteBookmarkService({ userId: userId!, bookmarkId });

  res
    .status(204)
    .json({ status: "success", message: "Bookmark deleted successfully" });
}
