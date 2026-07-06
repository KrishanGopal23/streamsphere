import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nickname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32
    },
    socketId: {
      type: String,
      default: null,
      index: true
    },
    roomId: {
      type: String,
      required: true,
      uppercase: true,
      index: true
    },
    avatar: {
      type: String,
      default: null
    },
    isHost: {
      type: Boolean,
      default: false
    },
    connected: {
      type: Boolean,
      default: true
    },
    joinOrder: {
      type: Number,
      default: 0
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

userSchema.index({ roomId: 1, nickname: 1 }, { unique: true });

export const User = mongoose.model("User", userSchema);
