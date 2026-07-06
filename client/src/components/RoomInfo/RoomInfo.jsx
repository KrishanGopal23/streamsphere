import { Copy, Lock, Radio, Settings, Share2, ShieldCheck, Unlock } from "lucide-react";
import toast from "react-hot-toast";

export default function RoomInfo({ room, nickname, connectionStatus, onOpenSettings }) {
  if (!room) return null;

  const isHost = room.host?.nickname === nickname;

  async function copyRoomId() {
    await navigator.clipboard.writeText(room.roomId);
    toast.success("Room ID copied");
  }

  async function copyInvite() {
    await navigator.clipboard.writeText(`${window.location.origin}/join?roomId=${room.roomId}`);
    toast.success("Invite link copied");
  }

  return (
    <section className="glass-panel rounded-lg px-4 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-lg font-extrabold tracking-tight sm:text-xl">{room.name}</h1>
            <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] px-2 py-1 text-xs font-semibold text-zinc-300">
              {room.settings?.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              {room.settings?.visibility}
            </span>
            {isHost ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-blue-400/30 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-100">
                <ShieldCheck className="h-3 w-3" />
                Host
              </span>
            ) : null}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
            <span>Room {room.roomId}</span>
            <span className="inline-flex items-center gap-1">
              <Radio className="h-3 w-3" aria-hidden="true" />
              {connectionStatus}
            </span>
            <span>{room.members?.filter((member) => member.connected).length || 0} online</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="icon-button" onClick={copyRoomId} aria-label="Copy room ID" title="Copy room ID">
            <Copy className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" className="icon-button" onClick={copyInvite} aria-label="Copy invite link" title="Copy invite link">
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </button>
          {isHost ? (
            <button type="button" className="icon-button" onClick={onOpenSettings} aria-label="Open room settings" title="Room settings">
              <Settings className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
