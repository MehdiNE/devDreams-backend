import { body, ValidationChain } from "express-validator";

export const createPostValidator: ValidationChain[] = [
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  body("tags").isArray(),
];
