import express from "express";
import asyncHandler from "../utils/asyncHandler";
import {
  createPostHandler,
  deletePostHandler,
  getOnePostHandler,
  getPostHandler,
} from "../controllers/postController";
import { protect } from "../controllers/authenticationController";

const router = express.Router();

router.get("/", asyncHandler(getPostHandler));
router.post("/", asyncHandler(protect), asyncHandler(createPostHandler));
router.delete("/:id", asyncHandler(protect), asyncHandler(deletePostHandler));
router.get("/:id", asyncHandler(getOnePostHandler));
// Update post

export default router;
