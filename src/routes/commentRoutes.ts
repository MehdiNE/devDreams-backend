import express from "express";
import asyncHandler from "../utils/asyncHandler";
import { protect } from "../controllers/authenticationController";
import {
  createCommentController,
  createReplyController,
  deleteCommentController,
  getCommentController,
  toggleLikeController,
} from "../controllers/commentController";

const router = express.Router();

router.post(
  "/posts/:postId",
  asyncHandler(protect),
  asyncHandler(createCommentController)
);
router.get("/posts/:postId", asyncHandler(getCommentController));
router.post(
  "/comment/:commentId/reply",
  asyncHandler(protect),
  asyncHandler(createReplyController)
);
router.put(
  "/comment/:commentId/toggle-like",
  asyncHandler(protect),
  asyncHandler(toggleLikeController)
);
router.delete(
  "/comment/:commentId",
  asyncHandler(protect),
  asyncHandler(deleteCommentController)
);

export default router;
