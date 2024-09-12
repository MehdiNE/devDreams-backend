import { Request, Response } from "express";
import {
  CreateCommentsParams,
  CreateCommentsReq,
  CreateReplyBody,
  CreateReplyParams,
  DeleteCommentsParams,
  LikeCommentsParams,
} from "../types/commentsType";
import { validateRequest } from "../utils/validateRequest";
import {
  createCommentsValidator,
  createReplyValidator,
} from "../validators/commentsValidators";
import {
  createCommentsService,
  deleteCommentService,
  getCommentsService,
  replyCommentService,
  toggleLikeService,
} from "../services/commentService";
import { Types } from "mongoose";

export async function createCommentController(
  req: Request<CreateCommentsParams, {}, CreateCommentsReq>,
  res: Response
) {
  const { content } = req.body;
  const { postId } = req.params;
  const userId = req.userId;

  await validateRequest(req, createCommentsValidator);

  const { comment } = await createCommentsService({
    author: userId!,
    content,
    postId,
  });

  res
    .status(201)
    .json({ status: "success", message: "comment created", data: comment });
}

export async function getCommentController(
  req: Request<CreateCommentsParams, {}, {}>,
  res: Response
) {
  const { postId } = req.params;

  const { comments } = await getCommentsService(postId);

  res.status(201).json({ status: "success", message: null, data: comments });
}

export async function toggleLikeController(
  req: Request<LikeCommentsParams, {}, {}>,
  res: Response
) {
  const { commentId } = req.params;
  const userId = req.userId;

  const { likes, isLiked } = await toggleLikeService({
    userId: userId as unknown as Types.ObjectId,
    commentId,
  });

  res
    .status(201)
    .json({ status: "success", message: null, data: { likes, isLiked } });
}

export async function deleteCommentController(
  req: Request<DeleteCommentsParams, {}, {}>,
  res: Response
) {
  const { commentId } = req.params;
  const userId = req.userId;

  await deleteCommentService({
    commentId,
    userId: userId as unknown as Types.ObjectId,
  });

  res.json({ status: "success", message: "Comment deleted successfully" });
}

export async function createReplyController(
  req: Request<CreateReplyParams, {}, CreateReplyBody>,
  res: Response
) {
  const { content } = req.body;
  const { commentId } = req.params;
  const userId = req.userId;

  await validateRequest(req, createReplyValidator);

  const reply = await replyCommentService({
    commentId,
    content,
    userId: userId!,
  });

  res.status(201).json({ status: "success", data: reply });
}
