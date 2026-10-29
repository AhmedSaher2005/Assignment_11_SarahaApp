import Joi from "joi";
import { Types } from "mongoose";

export const generalRoles = {
  email: Joi.string().email(),
  password: Joi.string(),
  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    path: Joi.string(),
    destination: Joi.string(),
    filename: Joi.string(),
    size: Joi.number(),
  }).messages({
    "any.required": "file is required",
  }),
  token: Joi.object({
    authorization: Joi.string().required(),
    "postman-token": Joi.string(),
    "content-length": Joi.string(),
    host: Joi.string(),
    "user-agent": Joi.string(),
    "accept-encoding": Joi.string(),
    connection: Joi.string(),
    accept: Joi.string(),
  }),
  id: Joi.string().custom((value, helper) => {
    return Types.ObjectId.isValid(value) ? value : helper.message("Invalid ID");
  }),
};
