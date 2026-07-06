import mongoose from "mongoose";

const roomSettingsSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      index: true
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private"
    },
    allowEveryoneControls: {
      type: Boolean,
      default: false
    },
    chatMuted: {
      type: Boolean,
      default: false
    },
    reactionsEnabled: {
      type: Boolean,
      default: true
    },
    locked: {
      type: Boolean,
      default: false
    },
    autoplay: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const RoomSettings = mongoose.model("RoomSettings", roomSettingsSchema);
