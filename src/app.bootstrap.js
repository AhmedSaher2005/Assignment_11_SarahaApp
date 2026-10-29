import { ALLOW_ORGINS, PORT } from "../config/config.service.js";
import express from "express";
import connectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors";
import connectionRedis from "./DB/connectionRedis.js";
import messageRouter from "./modules/message/message.controller.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
const app = express();
const port = PORT;
const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 35,
  standardHeaders: true,
  legacyHeaders: false,
});
const bootstrap = async () => {
  app.set("case sensitive routing", true);
  app.set("strict routing", true);

  app.use(
    cors({
      origin: function (origin, callback) {
        if ([...ALLOW_ORGINS, undefined].includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("not allowed this orgin"));
        }
      },
    }),
  );
  app.use(limiter);
  app.use(helmet());
  app.use(express.json());

  await connectionDB();
  await connectionRedis();
  app.get("/", (req, res) =>
    res.status(200).json({ message: "welcome on sara7a app...😘" }),
  );
  app.use("/users", userRouter);
  app.use("/message", messageRouter);

  app.use("{/*demo}", (req, res, next) => {
    throw new Error(
      `url:${req.originalUrl} with method:${req.method} not found`,
    );
  });

  app.use((err, req, res, next) => {
    //console.error(err);
    res
      .status(err.cause || 500)
      .json({ message: err.message, stack: err.stack });
  });

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};

export default bootstrap;
