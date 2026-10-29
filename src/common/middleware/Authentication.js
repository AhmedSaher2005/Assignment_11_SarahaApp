import jwt from "jsonwebtoken";
import { findOne } from "../../DB/service/DB.service.js";
import userModel from "../../DB/models/user.model.js";
import { ttl } from "../../DB/service/redis.service.js";
import { ACCESS_TOKEN_SIGNATURE } from "../../../config/config.service.js";

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("token is not exist", { cause: 409 });
  }
  const decoded = jwt.verify(authorization, ACCESS_TOKEN_SIGNATURE);
  if (!decoded?.id) {
    throw new Error("invalid token", { cause: 409 });
  }
  const user = await findOne({
    model: userModel,
    filter: { email: decoded.email.toLowerCase() },
  });
  if (!user) {
    throw new Error("user not exist", { cause: 409 });
  }
  if (!user?.isConfirmed) {
    throw new Error("Email is not confirmed please confirm your email ");
  }

  if (user?.changeCredentialAt?.getTime() > decoded.iat * 1000) {
    throw new Error("must be login again");
  }
  if ((await ttl(`revoke_tokoen::${user._id}::${decoded.jti}`)) > 0) {
    throw new Error("Invalid revoked-token you must login again");
  }
  req.user = user;
  req.decoded = decoded;
  next();
};
