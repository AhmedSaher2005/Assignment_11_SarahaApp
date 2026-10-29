import Joi from "joi";
import { generalRoles } from "../../common/utils/genaralRules.js";

export const signUpSchema = {
  body: Joi.object({
    fName: Joi.string().alphanum().min(2).max(10).required(),
    lName: Joi.string().required(),
    email: generalRoles.email.required(),
    password: generalRoles.password.required(),
    phone: Joi.string().required(),
    cPassword: Joi.string().valid(Joi.ref("password")),
    gender: Joi.string().valid("male", "female"),
    phone: Joi.string().required(),
    age: Joi.number().required().min(18).max(60).integer().positive(),
  })
    .required()
    .messages({
      "any.required": "body is empty",
    }),
  // file: generalRoles.file.required()
  // files: generalRoles.file.required()
  // files: Joi.object({
  //   image: Joi.array().items(generalRoles.file.required()).required(),
  //   images: Joi.array().items(generalRoles.file.required()).required(),
  // }).required(),
};

export const signInSchema = {
  body: Joi.object({
    email: generalRoles.email.required(),
    password: generalRoles.password.required(),
  }).required(),
};
export const refreshTokenSchema = {
  headers: generalRoles.token.required(),
};
export const shareProfileSchema = {
  params: Joi.object({
    id: generalRoles.id.required(),
  }).required(),
};

export const updateProfileSchema = {
  body: Joi.object({
    fName: Joi.string().alphanum().min(2).max(10),
    lName: Joi.string(),
    phone: Joi.string(),
    gender: Joi.string().valid("male", "female"),
    phone: Joi.string(),
    age: Joi.number().min(18).max(60).integer().positive(),
  }).required(),
};
export const updatePasswordSchema = {
  body: Joi.object({
    oldPassword: generalRoles.password.required(),
    newPassword: generalRoles.password.required(),
    cPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
  }).required(),
};
export const confirmEmailSchema = {
  body: Joi.object({
    email: Joi.string().required(),
    otp: Joi.string()
      .pattern(/^[0-9]{6}$/)
      .required(),
  }).required(),
};
export const forgetPasswordSchema = {
  body: Joi.object({
    email:generalRoles.email.required(),
  }).required(),
};

export const resetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().required(),
    code: Joi.string()
      .pattern(/^[0-9]{6}$/)
      .required(),
    password: generalRoles.password.required(),
  }).required(),
};
