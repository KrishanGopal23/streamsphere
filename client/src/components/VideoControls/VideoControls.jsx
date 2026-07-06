import { useEffect, useMemo, useState } from "react";
import {
  Maximize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX
} from "lucide-react";
import { PLAYBACK_SPEEDS } from "../../utils/constants.js";
import { formatTime } from "../../utils/formatters.js";

function getPlayerTime(player) {
  try {
    return player?.getCurrentTime?.() || 0;
  } catch {
    return 0;
  }
}

function getPlayerDuration(player) {
  try {
    return player?.getDuration?.() || 0;
  } catch {
    return 0;
  }
}

export default function VideoControls({
  player,
  syncState,
  canControl,
  queue = [],
  onPlayback,
  onNext,
  onPrevious
}) {
  const [currentTime, setCurrentTime] = useState(syncState?.currentTime || 0);
  const [duration, setDuration] = useState(0);
  const isPlaying = Boolean(syncState?.isPlaying);
  const volume = syncState?.volume ?? 70;
  const speed = syncState?.playbackSpeed ?? 1;
  const approvedQueue = useMemo(() => queue.filter((item) => item.status === "approved"), [queue]);

  useEffect(() => {
    setCurrentTime(syncState?.currentTime || 0);
  }, [syncState?.currentTime, syncState?.eventId]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCurrentTime(getPlayerTime(player));
      setDuration(getPlayerDuration(player));
    }, 500);

    return () => window.clearInterval(id);
  }, [player]);

  function emit(eventName, extra = {}) {
    if (!canControl) return;
    onPlayback?.(eventName, {
      currentTime: getPlayerTime(player),
      ...extra
    });
  }

  function toggleFullscreen() {
    const shell = document.getElementById("player-shell");
    if (!shell) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else {
      shell.requestFullscreen?.();
    }
  }

  return (
    <section className="glass-panel rounded-lg p-3">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="w-12 text-xs tabular-nums text-zinc-400">{formatTime(currentTime)}</span>
          <label className="sr-only" htmlFor="seek">
            Seek
          </label>
          <input
            id="seek"
            type="range"
            min="0"
            max={duration || Math.max(currentTime, 1)}
            value={Math.min(currentTime, duration || currentTime || 0)}
            disabled={!canControl}
            onChange={(event) => setCurrentTime(Number(event.target.value))}
            onMouseUp={(event) => emit("video-seek", { currentTime: Number(event.currentTarget.value) })}
            onTouchEnd={(event) => emit("video-seek", { currentTime: Number(event.currentTarget.value) })}
            className="h-2 w-full accent-blue-500"
          />
          <span className="w-12 text-right text-xs tabular-nums text-zinc-400">{formatTime(duration)}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" className="icon-button" onClick={onPrevious} disabled={!canControl} aria-label="Previous video" title="Previous">
              <SkipBack className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-button border-blue-400/50 bg-blue-500/15"
              onClick={() => emit(isPlaying ? "video-pause" : "video-play")}
              disabled={!canControl}
              aria-label={isPlaying ? "Pause" : "Play"}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => onNext?.(approvedQueue[0])}
              disabled={!canControl || !approvedQueue.length}
              aria-label="Next video"
              title="Next"
            >
              <SkipForward className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              {volume === 0 ? <VolumeX className="h-4 w-4 text-zinc-400" /> : volume < 50 ? <Volume1 className="h-4 w-4 text-zinc-400" /> : <Volume2 className="h-4 w-4 text-zinc-400" />}
              <label className="sr-only" htmlFor="volume">
                Volume
              </label>
              <input
                id="volume"
                type="range"
                min="0"
                max="100"
                value={volume}
                disabled={!canControl}
                onChange={(event) => emit("volume-change", { volume: Number(event.target.value) })}
                className="w-24 accent-blue-500"
              />
            </div>

            <label className="sr-only" htmlFor="playback-speed">
              Playback speed
            </label>
            <select
              id="playback-speed"
              value={speed}
              disabled={!canControl}
              onChange={(event) => emit("speed-change", { playbackSpeed: Number(event.target.value) })}
              className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-100"
            >
              {PLAYBACK_SPEEDS.map((value) => (
                <option key={value} value={value} className="bg-zinc-950">
                  {value}x
                </option>
              ))}
            </select>

            <button type="button" className="icon-button" onClick={toggleFullscreen} aria-label="Fullscreen" title="Fullscreen">
              <Maximize className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
