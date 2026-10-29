import fs from "node:fs";
import { resolve } from "node:path";
import multer from "multer";
import { randomUUID } from "node:crypto";

export const multerLocal = ({ customPath = "Genaral", customType = [] }) => {
  const fullPath = `uploads/${customPath}`;
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      cb(null, randomUUID() + "____" + file.originalname);
    },
  });
  function fileFilter(req, file, cb) {
    if (!customType.includes(file.mimetype)) {
      cb(new Error("invalid file"));
    } else {
      cb(null, true);
    }
  }
  const upload = multer({ storage, fileFilter });

  return upload;
};
