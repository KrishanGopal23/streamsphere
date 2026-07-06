import { useMemo, useState } from "react";
import { Crown, Lock, Shield, Trash2, Unlock, UserMinus } from "lucide-react";
import Modal from "../Modal/Modal.jsx";

function Toggle({ id, label, checked, onChange }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <span className="text-sm font-semibold text-zinc-100">{label}</span>
      <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${checked ? "bg-blue-600" : "bg-zinc-700"}`}>
        <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
        <span className="h-5 w-5 translate-x-0.5 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export default function Settings({
  open,
  onClose,
  room,
  nickname,
  onUpdate,
  onTransferHost,
  onKick,
  onDelete
}) {
  const [password, setPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const members = useMemo(
    () => (room?.members || []).filter((member) => member.nickname !== nickname),
    [room?.members, nickname]
  );

  if (!room) return null;

  const settings = room.settings || {};

  function updateSetting(key, value) {
    onUpdate?.({ [key]: value });
  }

  return (
    <Modal open={open} title="Room Settings" onClose={onClose}>
      <div className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Shield className="h-4 w-4 text-blue-300" aria-hidden="true" />
            Access
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="label">Visibility</span>
              <select
                className="field"
                value={settings.visibility || "private"}
                onChange={(event) => updateSetting("visibility", event.target.value)}
              >
                <option className="bg-zinc-950" value="public">
                  Public
                </option>
                <option className="bg-zinc-950" value="private">
                  Private
                </option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="label">Password</span>
              <div className="flex gap-2">
                <input
                  className="field"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="New password"
                />
                <button
                  type="button"
                  className="secondary-button shrink-0"
                  onClick={() => {
                    onUpdate?.({ password });
                    setPassword("");
                  }}
                >
                  Save
                </button>
              </div>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle id="locked" label={settings.locked ? "Locked" : "Unlocked"} checked={Boolean(settings.locked)} onChange={(value) => updateSetting("locked", value)} />
            <Toggle
              id="allow-controls"
              label="Everyone controls playback"
              checked={Boolean(settings.allowEveryoneControls)}
              onChange={(value) => updateSetting("allowEveryoneControls", value)}
            />
            <Toggle id="chat-muted" label="Mute chat" checked={Boolean(settings.chatMuted)} onChange={(value) => updateSetting("chatMuted", value)} />
            <Toggle
              id="reactions-enabled"
              label="Enable reactions"
              checked={settings.reactionsEnabled !== false}
              onChange={(value) => updateSetting("reactionsEnabled", value)}
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Crown className="h-4 w-4 text-amber-300" aria-hidden="true" />
            Members
          </div>
          <div className="space-y-2">
            {members.length ? (
              members.map((member) => (
                <div key={member.nickname} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{member.nickname}</p>
                    <p className="text-xs text-zinc-500">{member.connected ? "Connected" : "Disconnected"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => onTransferHost?.(member.nickname)}
                      aria-label={`Transfer host to ${member.nickname}`}
                      title="Transfer host"
                    >
                      <Crown className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="icon-button text-rose-200"
                      onClick={() => onKick?.(member.nickname)}
                      aria-label={`Kick ${member.nickname}`}
                      title="Kick member"
                    >
                      <UserMinus className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-white/10 p-4 text-center text-sm text-zinc-500">No other members</div>
            )}
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-rose-500/20 bg-rose-500/10 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-100">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete Room
          </div>
          <input
            className="field border-rose-500/20"
            value={deleteConfirm}
            onChange={(event) => setDeleteConfirm(event.target.value)}
            placeholder={`Type ${room.roomId}`}
            aria-label="Confirm room deletion"
          />
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={deleteConfirm !== room.roomId}
            onClick={onDelete}
          >
            {settings.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            Delete room
          </button>
        </section>
      </div>
    </Modal>
  );
}
