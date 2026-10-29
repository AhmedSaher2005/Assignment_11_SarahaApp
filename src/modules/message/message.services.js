import * as dbService from "../../DB/service/DB.service.js";
import userModel from "../../DB/models/user.model.js";
import messegeModel from "../../DB/models/message.model.js";
import { success_response } from "../../common/utils/success.response.js";

//=============================createMessage=========================
export const createMessage = async (req, res, next) => {
  const { content, userId } = req.body;
  if (!content && !req.files?.length) throw new Error("content is empty");
  const userExist = await dbService.findById({
    model: userModel,
    id: userId,
  });
  if (!userExist) throw new Error("User is not exist");
  let urls = [];
  if (req?.files?.length) {
    for (const file of req?.files) {
      urls.push(file.path);
    }
  }
  const message = await dbService.create({
    model: messegeModel,
    data: {
      content,
      attachments: urls,
      userId,
    },
  });

  return res.status(201).json({ message: "Signup done", message });
  success_response({
    res,
    statusCode: 201,
    message: "created",
    data: message,
  });
};
//=============================getMessages=========================
export const getMessages = async (req, res, next) => {
  const messages = await dbService.find({
    model: messegeModel,
    filter: {
      userId: req.user._id,
    },
  });

  success_response({ res, data: messages });
};

//=============================getMessageById=========================
export const getMessageById = async (req, res, next) => {
  const message = await dbService.findOne({
    model: messegeModel,
    filter: {
      _id: req.params.id,
      userId: req.user._id,
    },
  });

  success_response({ res, data: message });
};
