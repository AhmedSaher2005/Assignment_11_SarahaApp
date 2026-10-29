import { hashSync } from "bcrypt";
import sendEmail, { generate_otp } from "../../common/service/sendEmail.js";
import { eventEmitter } from "../../common/utils/event.js";
import {
  deleteKey,
  getValue,
  incr,
  setValue,
  ttl,
} from "../../DB/service/redis.service.js";
import userModel from "../../DB/models/user.model.js";
import * as dbService from "../../DB/service/DB.service.js";

export const sendEmailOtp = async ({ email, isConfirmed, subject }) => {
  const isBlocked_ttl = await ttl(`otp::block::${email}`);
  if (isBlocked_ttl > 0)
    throw new Error(
      `you blocked and you can resend otp after ${isBlocked_ttl} seconds`,
    );
  const otpTTL = await ttl(`otp::${email}`);
  if (otpTTL > 0) throw new Error(`you can resend otp after ${otpTTL} seconds`);
  const max_otp = await getValue(`otp::max:${email}`);
  if (max_otp >= 3) {
    await setValue({
      key: `otp::block::${email}`,
      value: "1",
      ttl: 60 * 10,
    });
    await deleteKey(`otp::max:${email}`);
    throw new Error("you have exceeded the maximum numbers of tries");
  }
  const user = await dbService.findOne({
    model: userModel,
    filter: {
      email,
      isConfirmed: { $exists: isConfirmed },
    },
  });
  if (!user) throw new Error("user not exist or already confirmed");
  const otp = await generate_otp();
  const otpHash = hashSync(otp, 12);
  await setValue({
    key: `otp::${email}`,
    value: otpHash,
    ttl: 60 * 20,
  });
  eventEmitter.emit("cofirm_email", async () => {
    await sendEmail({
      to: email,
      subject,
      html: `<h1>otp:${otp}</h1>`,
    });
  });
  await incr(`otp::max:${email}`);
};
