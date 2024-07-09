import express from "express";
import {
  handleLogin,
  handleSignup,
} from "../controllers/authenticationController";
import asyncHandler from "../utils/asyncHandler";

const router = express.Router();

router.post("/signup", asyncHandler(handleSignup));
router.post("/login", asyncHandler(handleLogin));

export default router;
