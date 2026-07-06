import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      uppercase: true,
      index: true
    },
    videoId: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },
    thumbnail: {
      type: String,
      default: ""
    },
    duration: {
      type: String,
      default: ""
    },
    requestedBy: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32
    },
    approvedBy: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ["suggested", "approved", "played", "skipped"],
      default: "suggested",
      index: true
    },
    position: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

queueSchema.index({ roomId: 1, position: 1, createdAt: 1 });

export const Queue = mongoose.model("Queue", queueSchema);
