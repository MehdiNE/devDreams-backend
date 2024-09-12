import { body, param, ValidationChain } from "express-validator";

export const createCommentsValidator: ValidationChain[] = [
  param("postId").notEmpty().withMessage("postId is required"),
  body("content").notEmpty().withMessage("content is required"),
];

export const createReplyValidator: ValidationChain[] = [
  param("commentId").notEmpty().withMessage("postId is required"),
  body("content").notEmpty().withMessage("content is required"),
];
