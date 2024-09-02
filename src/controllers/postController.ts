import { Request, Response } from "express";
import {
  PostIdParams,
  PostRequest,
  PostRequestResponse,
} from "../types/postTypes";
import { validateRequest } from "../utils/validateRequest";
import { createPostValidator } from "../validators/postValidators";
import {
  createPostService,
  deletePostService,
  getOnePostService,
  getPostService,
} from "../services/postService";

export const createPostHandler = async (
  req: Request<{}, {}, PostRequest>,
  res: Response<PostRequestResponse>
) => {
  const { title, content, tags } = req.body;
  const authorId = req.userId!;

  await validateRequest(req, createPostValidator);

  const { newPost } = await createPostService({
    title,
    content,
    authorId,
    tags,
  });

  res.status(201).json({
    status: "success",
    message: "Post created successfully!",
    data: newPost,
  });
};

export const getPostHandler = async (_req: Request, res: Response) => {
  const { posts } = await getPostService();

  res.status(200).json({
    status: "success",
    message: null,
    data: posts,
    counts: posts?.length,
  });
};

export const deletePostHandler = async (
  req: Request<PostIdParams>,
  res: Response
) => {
  const { id } = req.params;
  const userId = req.userId!;

  await deletePostService({ userId: userId, postId: id });

  res.status(200).json({
    status: "success",
    message: "Post Deleted successfully!",
    data: null,
  });
};

export const getOnePostHandler = async (
  req: Request<PostIdParams>,
  res: Response
) => {
  const { id } = req.params;

  const post = await getOnePostService(id);

  res.status(200).json({
    status: "success",
    message: null,
    data: post,
  });
};
