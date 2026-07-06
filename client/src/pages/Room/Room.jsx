import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Clapperboard, ListPlus, Play, Trash2 } from "lucide-react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { messagesApi } from "../../api/messages.js";
import { queueApi } from "../../api/queue.js";
import { roomsApi } from "../../api/rooms.js";
import Chat from "../../components/Chat/Chat.jsx";
import Loader from "../../components/Loader/Loader.jsx";
import MemberList from "../../components/MemberList/MemberList.jsx";
import ReactionOverlay from "../../components/ReactionOverlay/ReactionOverlay.jsx";
import RoomInfo from "../../components/RoomInfo/RoomInfo.jsx";
import Settings from "../../components/Settings/Settings.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import YouTubePlayer from "../../components/Player/YouTubePlayer.jsx";
import VideoControls from "../../components/VideoControls/VideoControls.jsx";
import VideoSearch from "../../components/VideoSearch/VideoSearch.jsx";
import { useSocket } from "../../hooks/useSocket.js";
import { initialRoomState, roomReducer } from "../../store/roomStore.js";
import { DEFAULT_VIDEO, REACTION_EMOJIS } from "../../utils/constants.js";
import { cn } from "../../utils/cn.js";
import { getSession, saveSession } from "../../utils/session.js";

const joinSchema = z.object({
  nickname: z.string().min(2).max(32),
  password: z.string().max(80).optional().or(z.literal(""))
});

function socketAck(socket, eventName, payload) {
  return new Promise((resolve) => {
    socket.emit(eventName, payload, resolve);
  });
}

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, status } = useSocket();
  const [state, dispatch] = useReducer(roomReducer, initialRoomState);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [player, setPlayer] = useState(null);
  const [activePanel, setActivePanel] = useState("watch");
  const [session, setSession] = useState(() => getSession(roomId));
  const [videoHistory, setVideoHistory] = useState([]);
  const typingRef = useRef(new Map());
  const lastJoinedSocketRef = useRef(null);
  const joiningRef = useRef(false);
  const heartbeatRef = useRef(null);

  const roomQuery = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => roomsApi.get(roomId),
    enabled: Boolean(roomId),
    retry: 1
  });

  const messagesQuery = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => messagesApi.list(roomId),
    enabled: Boolean(roomId),
    retry: 1
  });

  const queueQuery = useQuery({
    queryKey: ["queue", roomId],
    queryFn: () => queueApi.list(roomId),
    enabled: Boolean(roomId),
    retry: 1
  });

  useEffect(() => {
    if (roomQuery.data) {
      dispatch({ type: "SET_ROOM", room: roomQuery.data });
      dispatch({ type: "SET_SYNC", syncState: roomQuery.data.syncState });
    }
  }, [roomQuery.data]);

  useEffect(() => {
    if (messagesQuery.data) dispatch({ type: "SET_MESSAGES", messages: messagesQuery.data });
  }, [messagesQuery.data]);

  useEffect(() => {
    if (queueQuery.data) dispatch({ type: "SET_QUEUE", queue: queueQuery.data });
  }, [queueQuery.data]);

  const nickname = session?.nickname || "";
  const room = state.room;
  const syncState = state.syncState || room?.syncState;
  const currentVideo = syncState?.currentVideo || room?.currentVideo || DEFAULT_VIDEO;
  const isHost = room?.host?.nickname === nickname;
  const canControl = Boolean(room && (isHost || room.settings?.allowEveryoneControls));

  const joinSocketRoom = useCallback(async () => {
    if (!socket.connected || !session?.nickname || !roomId) return;
    if (lastJoinedSocketRef.current === socket.id) return;
    if (joiningRef.current) return;

    joiningRef.current = true;
    const response = await socketAck(socket, "join-room", {
      roomId,
      nickname: session.nickname,
      password: session.password || ""
    });

    if (response?.success) {
      lastJoinedSocketRef.current = socket.id;
      dispatch({ type: "SET_ROOM", room: response.data.room });
      dispatch({ type: "SET_SYNC", syncState: response.data.syncState });
    } else {
      lastJoinedSocketRef.current = null;
      toast.error(response?.message || "Could not join room");
      setSession(null);
    }
    joiningRef.current = false;
  }, [roomId, session, socket]);

  useEffect(() => {
    joinSocketRoom();
  }, [joinSocketRoom, status]);

  useEffect(() => {
    if (!session?.nickname || !roomId) return undefined;

    heartbeatRef.current = window.setInterval(() => {
      socket.emit("heartbeat", { roomId });
    }, 15_000);

    return () => window.clearInterval(heartbeatRef.current);
  }, [roomId, session?.nickname, socket]);

  useEffect(() => {
    function setTypingUsers() {
      dispatch({ type: "SET_TYPING", users: Array.from(typingRef.current.keys()) });
    }

    function handleRoomUpdated(nextRoom) {
      dispatch({ type: "SET_ROOM", room: nextRoom });
    }

    function handleSync(nextSync) {
      dispatch({ type: "SET_SYNC", syncState: nextSync });
    }

    function handleMessage(message) {
      dispatch({ type: "ADD_MESSAGE", message });
    }

    function handleQueue(queue) {
      dispatch({ type: "SET_QUEUE", queue });
    }

    function handleReaction(reaction) {
      dispatch({ type: "ADD_REACTION", reaction });
    }

    function handleTypingStart({ nickname: typingNickname }) {
      if (!typingNickname || typingNickname === nickname) return;
      window.clearTimeout(typingRef.current.get(typingNickname));
      typingRef.current.set(
        typingNickname,
        window.setTimeout(() => {
          typingRef.current.delete(typingNickname);
          setTypingUsers();
        }, 1800)
      );
      setTypingUsers();
    }

    function handleTypingStop({ nickname: typingNickname }) {
      window.clearTimeout(typingRef.current.get(typingNickname));
      typingRef.current.delete(typingNickname);
      setTypingUsers();
    }

    function handleKicked() {
      toast.error("You were removed from the room");
      navigate("/join", { replace: true });
    }

    socket.on("room-updated", handleRoomUpdated);
    socket.on("sync-state", handleSync);
    socket.on("chat-message", handleMessage);
    socket.on("queue-updated", handleQueue);
    socket.on("reaction", handleReaction);
    socket.on("typing-start", handleTypingStart);
    socket.on("typing-stop", handleTypingStop);
    socket.on("member-kicked", handleKicked);

    return () => {
      socket.off("room-updated", handleRoomUpdated);
      socket.off("sync-state", handleSync);
      socket.off("chat-message", handleMessage);
      socket.off("queue-updated", handleQueue);
      socket.off("reaction", handleReaction);
      socket.off("typing-start", handleTypingStart);
      socket.off("typing-stop", handleTypingStop);
      socket.off("member-kicked", handleKicked);
    };
  }, [navigate, nickname, socket]);

  const emitPlayback = useCallback(
    (eventName, payload = {}) => {
      if (!canControl) return;
      socket.emit(eventName, {
        roomId,
        nickname,
        ...payload,
        eventId: `${eventName}:${socket.id}:${Date.now()}`
      });
    },
    [canControl, nickname, roomId, socket]
  );

  const changeVideo = useCallback(
    (video) => {
      if (!video?.videoId || !canControl) return;
      if (currentVideo?.videoId) {
        setVideoHistory((history) => [currentVideo, ...history].slice(0, 12));
      }
      emitPlayback("video-change", video);
    },
    [canControl, currentVideo, emitPlayback]
  );

  function sendMessage(message) {
    socket.emit("chat-message", { roomId, nickname, message });
  }

  function sendReaction(emoji) {
    socket.emit("reaction", { roomId, nickname, emoji });
  }

  function suggestVideo(video) {
    socket.emit("queue-add", {
      roomId,
      requestedBy: nickname,
      ...video
    });
    toast.success(canControl ? "Added to queue" : "Suggested to host");
  }

  function approveQueueItem(itemId) {
    socket.emit("queue-approve", { roomId, hostNickname: nickname, itemId });
  }

  function removeQueueItem(itemId) {
    socket.emit("queue-remove", { roomId, nickname, itemId });
  }

  function playQueueItem(item) {
    if (!item) return;
    changeVideo(item);
    removeQueueItem(item._id || item.queueItemId);
  }

  function playPrevious() {
    const [previous, ...rest] = videoHistory;
    if (!previous) return;
    setVideoHistory(rest);
    emitPlayback("video-change", previous);
  }

  async function joinFromForm(values) {
    const responseRoom = await roomsApi.join({ roomId, ...values });
    saveSession(responseRoom.roomId, values);
    setSession(values);
    dispatch({ type: "SET_ROOM", room: responseRoom });
    dispatch({ type: "SET_SYNC", syncState: responseRoom.syncState });
    toast.success("Joined room");
  }

  function updateSettings(payload) {
    if (!isHost) return;

    if (payload.locked === true) {
      socket.emit("room-locked", { roomId, hostNickname: nickname });
      return;
    }

    if (payload.locked === false) {
      socket.emit("room-unlocked", { roomId, hostNickname: nickname });
      return;
    }

    socket.emit("room-settings-update", { roomId, hostNickname: nickname, ...payload });
  }

  async function deleteRoom() {
    await roomsApi.delete(roomId, nickname);
    toast.success("Room deleted");
    navigate("/", { replace: true });
  }

  if (roomQuery.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#09090B_0%,#111827_46%,#18181B_100%)]">
        <Loader label="Loading room" />
      </main>
    );
  }

  if (!session?.nickname) {
    return <JoinGate room={roomQuery.data} roomId={roomId} onJoin={joinFromForm} />;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#09090B_0%,#111827_46%,#18181B_100%)] p-3 text-zinc-50">
      <div className="grid min-h-[calc(100vh-24px)] gap-3 lg:grid-cols-[64px_minmax(0,1fr)_360px_280px] lg:grid-rows-[auto_minmax(0,1fr)]">
        <div className="lg:row-span-2">
          <Sidebar
            active={activePanel}
            onSelect={(panel) => {
              if (panel === "settings") {
                setSettingsOpen(true);
              } else {
                setActivePanel(panel);
              }
            }}
            connectionStatus={status}
          />
        </div>

        <div className="lg:col-span-3">
          <RoomInfo room={room} nickname={nickname} connectionStatus={status} onOpenSettings={() => setSettingsOpen(true)} />
        </div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("min-h-0 space-y-3", activePanel !== "watch" && "hidden lg:block")}
        >
          <div className="glass-panel relative rounded-lg p-3">
            <ReactionOverlay reactions={state.reactions} onComplete={(id) => dispatch({ type: "REMOVE_REACTION", id })} />
            <YouTubePlayer
              video={currentVideo}
              syncState={syncState}
              canControl={canControl}
              nickname={nickname}
              onPlayerReady={setPlayer}
              onLocalPlayback={emitPlayback}
              onError={toast.error}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold">{currentVideo.title}</h2>
                <p className="truncate text-sm text-zinc-400">{currentVideo.channel}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-lg transition hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => sendReaction(emoji)}
                    disabled={room?.settings?.reactionsEnabled === false}
                    aria-label={`React ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <VideoControls
            player={player}
            syncState={syncState}
            canControl={canControl}
            queue={state.queue}
            onPlayback={emitPlayback}
            onNext={playQueueItem}
            onPrevious={playPrevious}
          />

          <div className="grid min-h-80 gap-3 xl:grid-cols-[minmax(0,1fr)_360px]">
            <VideoSearch canControl={canControl} onSelect={changeVideo} onSuggest={suggestVideo} />
            <QueuePanel
              queue={state.queue}
              isHost={isHost}
              canControl={canControl}
              onPlay={playQueueItem}
              onApprove={approveQueueItem}
              onRemove={removeQueueItem}
            />
          </div>
        </motion.section>

        <div className={cn("min-h-[560px] lg:min-h-0", activePanel !== "chat" && "hidden lg:block")}>
          <Chat
            messages={state.messages}
            nickname={nickname}
            typingUsers={state.typingUsers}
            muted={room?.settings?.chatMuted && !isHost}
            onSend={sendMessage}
            onTypingStart={() => socket.emit("typing-start", { roomId, nickname })}
            onTypingStop={() => socket.emit("typing-stop", { roomId, nickname })}
          />
        </div>

        <div className={cn("min-h-[420px] lg:min-h-0", activePanel !== "members" && "hidden lg:block")}>
          <MemberList members={room?.members || []} hostNickname={room?.host?.nickname} />
        </div>
      </div>

      <Settings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        room={room}
        nickname={nickname}
        onUpdate={updateSettings}
        onTransferHost={(nextHostNickname) => socket.emit("host-transfer", { roomId, hostNickname: nickname, nextHostNickname })}
        onKick={(targetNickname) => socket.emit("member-kicked", { roomId, hostNickname: nickname, targetNickname })}
        onDelete={deleteRoom}
      />
    </main>
  );
}

function QueuePanel({ queue = [], isHost, canControl, onPlay, onApprove, onRemove }) {
  return (
    <section className="glass-panel flex min-h-0 flex-col rounded-lg">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <ListPlus className="h-4 w-4 text-blue-300" aria-hidden="true" />
          <h2 className="text-sm font-bold">Playlist Queue</h2>
        </div>
        <span className="text-xs text-zinc-500">{queue.length}</span>
      </header>
      <div className="thin-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {queue.length ? (
          queue.map((item) => {
            const itemId = item._id || item.queueItemId;

            return (
              <article key={itemId} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-2">
                <img src={item.thumbnail} alt="" className="aspect-video w-24 rounded-md object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs text-zinc-500">By {item.requestedBy}</p>
                  <span className="mt-2 inline-flex rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400">{item.status}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    className="icon-button h-8 w-8"
                    onClick={() => onPlay(item)}
                    disabled={!canControl || item.status !== "approved"}
                    aria-label="Play queued video"
                    title="Play"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  {isHost && item.status === "suggested" ? (
                    <button type="button" className="icon-button h-8 w-8" onClick={() => onApprove(itemId)} aria-label="Approve queued video" title="Approve">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : null}
                  <button type="button" className="icon-button h-8 w-8 text-rose-200" onClick={() => onRemove(itemId)} aria-label="Remove queued video" title="Remove">
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="grid min-h-40 place-items-center text-sm text-zinc-500">Queue is empty</div>
        )}
      </div>
    </section>
  );
}

function JoinGate({ room, roomId, onJoin }) {
  const form = useForm({
    resolver: zodResolver(joinSchema),
    defaultValues: {
      nickname: "",
      password: ""
    }
  });

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#09090B_0%,#111827_46%,#18181B_100%)] px-4 py-12">
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={form.handleSubmit(onJoin)}
        className="glass-panel w-full max-w-md rounded-lg p-6"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
            <Clapperboard className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold">{room?.name || "Join StreamSphere"}</h1>
            <p className="text-sm text-zinc-500">Room {room?.roomId || roomId}</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="space-y-2">
            <span className="label">Nickname</span>
            <input className="field" {...form.register("nickname")} placeholder="Ava" />
          </label>
          <label className="space-y-2">
            <span className="label">Password</span>
            <input className="field" type="password" {...form.register("password")} placeholder="Optional" />
          </label>
          <button type="submit" className="primary-button w-full">
            Join Room
          </button>
        </div>
      </motion.form>
    </main>
  );
}
