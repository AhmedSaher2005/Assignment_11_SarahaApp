import Joi from "joi";
import { generalRoles } from "../../common/utils/genaralRules.js";

export const createMessageSchema = {
  body: Joi.object({
    content: Joi.string(),
    userId: generalRoles.id.required(),
  })
  .required(),
  files: Joi.array().items(generalRoles.file),
};

