import express from "express";
import {
  forgotPassword,
  handleLogin,
  handleSignOut,
  handleSignup,
  protect,
  refreshTokenHandler,
  resetPassword,
  updatePassword,
} from "../controllers/authenticationController";
import asyncHandler from "../utils/asyncHandler";

const router = express.Router();

router.post("/signup", asyncHandler(handleSignup));
router.post("/login", asyncHandler(handleLogin));

router.post("/forgotPassword", asyncHandler(forgotPassword));
router.patch("/resetPassword/:token", asyncHandler(resetPassword));

router.patch(
  "/updatePassword",
  asyncHandler(protect),
  asyncHandler(updatePassword)
);

router.post("/signOut", asyncHandler(protect), asyncHandler(handleSignOut));
router.post("/refreshToken", asyncHandler(refreshTokenHandler));

export default router;
