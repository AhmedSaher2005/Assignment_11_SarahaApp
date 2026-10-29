import { Router } from "express";
import * as US from "./user.services.js";
import { authentication } from "../../common/middleware/Authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { roleEnum } from "../../common/enum/user.enum.js";
import { validation } from "../../common/middleware/validation.js";
import * as VS from "./user.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";

const userRouter = Router({
  strict: true,
  caseSensitive: true,
});

userRouter.post(
  "/signUp",
  multerLocal({ customPath: "admin", customType: ["image/jpeg"] }).fields([
    { name: "image", max: 1 },
    { name: "images", max: 3 },
  ]),
  validation(VS.signUpSchema),
  US.signUP,
);
userRouter.post("/signup/gmail", US.signUPWithGmail);
userRouter.post(
  "/refresh-token",
  validation(VS.refreshTokenSchema),
  US.refreshToken,
);
userRouter.get("/signIn", validation(VS.signInSchema), US.signIn);
userRouter.get(
  "/getProfile",
  authentication,
  authorization(Object.values(roleEnum)),
  US.getProfile,
);
userRouter.get(
  "/share-profile/:id",
  validation(VS.shareProfileSchema),
  US.shareProfile,
);
userRouter.patch(
  "/update-profile",
  validation(VS.updateProfileSchema),
  authentication,
  US.updateProfile,
);
userRouter.patch(
  "/updatePassword",
  validation(VS.updatePasswordSchema),
  authentication,
  US.updatePassword,
);
userRouter.patch(
  "/forgetPassword",
  validation(VS.forgetPasswordSchema),
  authentication,
  US.forgetPassword,
);
userRouter.patch(
  "/resetPassword",
  validation(VS.resetPasswordSchema),
  US.resetPassword,
);

userRouter.patch(
  "/confirmEmail",
  validation(VS.confirmEmailSchema),
  US.confirmEmail,
);
userRouter.patch("/resend_otp", US.reSendOtp);

userRouter.patch("/logOut", authentication, US.logOut);

export default userRouter;
