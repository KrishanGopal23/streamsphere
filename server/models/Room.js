import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    nickname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32
    },
    socketId: {
      type: String,
      default: null
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
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeenAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const videoSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      default: "jfKfPfyJRdk"
    },
    title: {
      type: String,
      default: "lofi hip hop radio - beats to relax/study to"
    },
    channel: {
      type: String,
      default: "Lofi Girl"
    },
    thumbnail: {
      type: String,
      default: "https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault.jpg"
    },
    duration: {
      type: String,
      default: ""
    }
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
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
  { _id: false }
);

const queueSnapshotSchema = new mongoose.Schema(
  {
    queueItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    videoId: String,
    title: String,
    thumbnail: String,
    requestedBy: String,
    duration: String,
    status: String,
    position: Number
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    passwordHash: {
      type: String,
      default: null,
      select: false
    },
    host: {
      nickname: {
        type: String,
        required: true,
        trim: true,
        maxlength: 32
      },
      socketId: {
        type: String,
        default: null
      },
      avatar: {
        type: String,
        default: null
      }
    },
    currentVideo: {
      type: videoSchema,
      default: () => ({})
    },
    currentTime: {
      type: Number,
      default: 0,
      min: 0
    },
    playbackSpeed: {
      type: Number,
      default: 1,
      min: 0.25,
      max: 2
    },
    volume: {
      type: Number,
      default: 70,
      min: 0,
      max: 100
    },
    isPlaying: {
      type: Boolean,
      default: false
    },
    lastSyncAt: {
      type: Date,
      default: Date.now
    },
    members: {
      type: [memberSchema],
      default: []
    },
    settings: {
      type: settingsSchema,
      default: () => ({})
    },
    queue: {
      type: [queueSnapshotSchema],
      default: []
    }
  },
  { timestamps: true }
);

roomSchema.index({ "members.nickname": 1, roomId: 1 });

export const Room = mongoose.model("Room", roomSchema);
