import { Request } from "express";
import { ValidationChain, validationResult } from "express-validator";

export const validateRequest = async (
  req: Request<any>,
  validations: ValidationChain[]
) => {
  await Promise.all(validations.map((validation) => validation.run(req)));
  return validationResult(req);
};
