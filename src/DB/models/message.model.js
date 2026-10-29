import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: function () {
        return this.attachments?.length ? false : true;
      },
    },
    attachments: [String],
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const messegeModel =
  mongoose.models.messages || mongoose.model("messege", messageSchema);
export default messegeModel;
