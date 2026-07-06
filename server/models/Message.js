import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      uppercase: true,
      index: true
    },
    nickname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    type: {
      type: String,
      enum: ["text", "system"],
      default: "text"
    }
  },
  { timestamps: true }
);

messageSchema.index({ roomId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
