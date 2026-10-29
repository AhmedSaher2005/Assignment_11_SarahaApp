import { compare, compareSync, hashSync } from "bcrypt";
import { Decrypt, Encrypt } from "../../common/security/encrypt.js";
import * as dbService from "../../DB/service/DB.service.js";
import userModel from "../../DB/models/user.model.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { providerEnum } from "../../common/enum/user.enum.js";
import { randomUUID } from "node:crypto";
import {
  deleteKey,
  getValue,
  Keys,
  setValue,
} from "../../DB/service/redis.service.js";
import sendEmail, { generate_otp } from "../../common/service/sendEmail.js";
import { eventEmitter } from "../../common/utils/event.js";
import { sendEmailOtp } from "./user.helper.js";
import {
  ACCESS_TOKEN_SIGNATURE,
  AUDIENCE,
  REFRESH_TOKEN_SIGNATURE,
  SALT_ROUND,
} from "../../../config/config.service.js";
import { success_response } from "../../common/utils/success.response.js";

//=============================signUP=========================
export const signUP = async (req, res, next) => {
  const { fName, lName, email, password, age, gender, phone } = req.body;
  const emailExist = await dbService.findOne({
    model: userModel,
    filter: { email: email.toLowerCase() },
  });
  if (emailExist) {
    throw new Error("Email already exist", { cause: 409 });
  }
  const hashPassword = hashSync(password, SALT_ROUND);
  // const paths = [];
  // for (const file of req.files.images) {
  //   paths.push(file.path);
  // }

  const otp = await generate_otp();
  const otpHash = hashSync(otp, SALT_ROUND);
  await setValue({
    key: `otp::${email}`,
    value: otpHash,
    ttl: 60 * 20,
  });
  await setValue({
    key: `otp::max:${email}`,
    value: 1,
    ttl: 60 * 5,
  });
  eventEmitter.emit("cofirm_email", async () => {
    await sendEmail({
      to: email,
      subject: "Confirm Email",
      html: `<h1>otp:${otp}</h1>`,
    });
  });

  const user = await dbService.create({
    model: userModel,
    data: {
      fName,
      lName,
      email,
      password: hashPassword,
      // profileImage: req.files.images[0].path,
      // coverImage: paths,
      age,
      gender,
      phone: Encrypt(phone),
    },
  });
  success_response({ res, stausCode: 201, message: "Signup done", data: user });
};

// ==================== reSendOtp ====================
export const reSendOtp = async (req, res, next) => {
  const { email } = req.body;
  await sendEmailOtp({ email, isConfirmed: false });
  success_response({ res });
};
//=============================confirmEmail=========================

export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;
  const otpValue = await getValue(`otp::${email}`);
  if (!otpValue) {
    throw new Error("otp expire", { cause: 400 });
  }
  if (!compareSync(otp, otpValue)) {
    throw new Error("Invalid otp", { cause: 400 });
  }
  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      isConfirmed: { $exists: false },
    },
    update: {
      isConfirmed: true,
    },
  });
  if (!user) {
    throw new Error("user is not exist or already confirmed", { cause: 400 });
  }
  await deleteKey(`otp::${email}`);
  success_response({ res, data: user });
};
//=============================signIN=========================

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await dbService.findOne({
    model: userModel,
    filter: {
      email: email.toLowerCase(),
      provider: providerEnum.system,
      isConfirmed: { $exists: true },
    },
  });
  if (!user) {
    throw new Error("Email is not exist", { cause: 409 });
  }
  if (!compareSync(password, user.password)) {
    throw new Error("invalid password", { cause: 409 });
  }

  const tokenId = randomUUID();
  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    ACCESS_TOKEN_SIGNATURE,
    {
      expiresIn: "1d",
      jwtid: tokenId,
    },
  );
  const refresh_token = jwt.sign({ id: user._id }, REFRESH_TOKEN_SIGNATURE, {
    expiresIn: "1d",
    jwtid: tokenId,
  });

  success_response({
    res,
    data: { access_token, refresh_token },
  });
};
//=============================getProfile=========================
export const getProfile = async (req, res, next) => {
  success_response({ res, data: req.user });
};
//=============================shareProfile=========================
export const shareProfile = async (req, res, next) => {
  const { id } = req.params;
  let user = await dbService.findById({
    model: userModel,
    id,
    option: { password: 0 },
  });
  if (!user) {
    throw new Error("Email is not exist", { cause: 409 });
  }
  user.phone = Decrypt(user.phone);
  success_response({ res, data: user });
};
//=============================signUp With Google=========================
const client = new OAuth2Client();
export const signUPWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const decoded = await client.verifyIdToken({
    idToken,
    audience: AUDIENCE,
  });
  const { email, email_verified, picture, given_name, family_name } =
    decoded.getPayload();

  let user = await userModel.findOne({
    email: email.toLowerCase(),
  });
  if (!user) {
    user = await dbService.create({
      model: userModel,
      data: {
        fName: given_name,
        lName: family_name,
        email,
        profileImage: picture,
        isConfirmed: email_verified,
        provider: providerEnum.google,
      },
    });
  }
  if (user.provider == providerEnum.system) {
    throw new Error("sign in with application");
  }

  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    ACCESS_TOKEN_SIGNATURE,
    {
      expiresIn: "1h",
    },
  );
  const refresh_token = jwt.sign({ id: user._id }, REFRESH_TOKEN_SIGNATURE, {
    expiresIn: "1d",
  });

  return res.status(200).json({
    message: "done",
    tokens: { access_token, refresh_token },
  });
  success_response({
    res,
    statusCode: 201,
    message: "sign up done",
    data: { access_token, refresh_token },
  });
};
//=============================refreshToken=========================

export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("token is not exist", { cause: 409 });
  }
  const decoded = jwt.verify(authorization, REFRESH_TOKEN_SIGNATURE);
  if (!decoded?.id) {
    throw new Error("invalid token", { cause: 409 });
  }
  const user = await dbService.findOne({
    model: userModel,
    filter: { _id: decoded.id },
  });
  if (!user) {
    throw new Error("user not exist", { cause: 409 });
  }
  const access_token = jwt.sign(
    { id: user._id, email: user.email },
    ACCESS_TOKEN_SIGNATURE,
    {
      expiresIn: "1h",
    },
  );

  success_response({ res, data: access_token });
};

//=============================updateProfile=========================
export const updateProfile = async (req, res, next) => {
  const { fName, lName, age, gender, phone } = req.body;
  let updateQuery = {};
  if (fName !== undefined) {
    updateQuery.fName = fName;
  }
  if (lName !== undefined) {
    updateQuery.lName = lName;
  }
  if (age !== undefined) {
    updateQuery.age = age;
  }
  if (gender !== undefined) {
    updateQuery.gender = gender;
  }
  if (phone !== undefined) {
    updateQuery.phone = Encrypt(phone);
  }
  let user = await dbService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    update: updateQuery,
  });
  success_response({ res, data: user });
};
//=============================updatePassword=========================
export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!compareSync(oldPassword, req.user.password)) {
    throw new Error("Password does not match");
  }
  ((req.user.password = hashSync(newPassword, 10)),
    (req.user.changeCredentialAt = new Date()));
  await req.user.save();

  success_response({
    res,
    message: "updated successfully",
    data: req.user,
  });
};
//=============================forgetPassword=========================
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  await sendEmailOtp({ email, isConfirmed: true, subject: "reset password" });

  success_response({ res, message: "Otp Sent" });
};
//=============================resetPassword=========================
export const resetPassword = async (req, res, next) => {
  const { email, code, password } = req.body;
  const otp = await getValue(`otp::${email}`);
  if (!otp) throw new Error("otp expierd");
  if (!compareSync(code, otp)) throw new Error("invalid otp");
  const user = await dbService.findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      isConfirmed: { $exists: true },
    },
    update: {
      password: hashSync(password, SALT_ROUND),
      changeCredentialAt: new Date(),
    },
  });
  if (!user) {
    throw new Error("user not found", { cause: 409 });
  }
  await deleteKey(`otp::${email}`);
  success_response({
    res,
    data: req.user,
  });
};

//=============================logOut=========================
export const logOut = async (req, res, next) => {
  const { flag } = req.query;

  if (flag == "all") {
    ((req.user.changeCredentialAt = new Date()), await req.user.save());
    await deleteKey(await Keys(`revoke_tokoen::${req.user._id}`));
  } else {
    console.log(req.decoded.exp - Math.floor(Date.now() / 1000));

    await setValue({
      key: `revoke_tokoen::${req.user._id}::${req.decoded.jti}`,
      value: `${req.decoded.jti}`,
      ttl: req.decoded.exp - Math.floor(Date.now() / 1000),
    });
  }

  success_response({ res, message: "log out done" });
};
