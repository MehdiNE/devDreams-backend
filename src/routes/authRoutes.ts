import express from "express";
import {
  forgotPassword,
  googleRedirectController,
  handleLogin,
  handleSignOut,
  handleSignup,
  protect,
  refreshTokenHandler,
  resetPassword,
  updatePassword,
} from "../controllers/authenticationController";
import asyncHandler from "../utils/asyncHandler";
import passport from "passport";

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

// Google
router.get("/google", passport.authenticate("google"));
router.get(
  "/google/redirect",
  passport.authenticate("google", { session: false }),
  googleRedirectController
);

export default router;
