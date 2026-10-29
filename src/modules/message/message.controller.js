import { Router } from "express";
import * as MS from "./message.services.js";
import { authentication } from "../../common/middleware/Authentication.js";
import * as MV from "./message.validation.js";
import { multerLocal } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/multer.enum.js";
import { validation } from "../../common/middleware/validation.js";

const messageRouter = Router({
  strict: true,
  caseSensitive: true,
});

messageRouter.post(
  "/",
  multerLocal({
    customPath: "messages",
    customType: multer_enum.attachments,
  }).array("attachments", 3),
  validation(MV.createMessageSchema),
  MS.createMessage,
);

messageRouter.get("/",authentication, MS.getMessages);
messageRouter.get("/:id", authentication, MS.getMessageById);

export default messageRouter;
