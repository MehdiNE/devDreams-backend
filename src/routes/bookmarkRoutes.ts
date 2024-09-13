import express from "express";
import {
  createBookmarkController,
  deleteBookmarkController,
  getUserBookmarksController,
} from "../controllers/bookmarkController";
import asyncHandler from "../utils/asyncHandler";
import { protect } from "../controllers/authenticationController";

const router = express.Router();

router.use(asyncHandler(protect));

router.post("/", asyncHandler(createBookmarkController));
router.get("/", asyncHandler(getUserBookmarksController));
router.delete("/:id", asyncHandler(deleteBookmarkController));

export default router;
