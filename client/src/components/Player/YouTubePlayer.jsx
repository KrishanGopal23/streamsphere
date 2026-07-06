import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { loadYouTubeIframeApi } from "../../services/youtubeIframe.js";
import { DEFAULT_VIDEO } from "../../utils/constants.js";

const PLAYER_STATES = {
  PLAYING: 1,
  PAUSED: 2
};

function safeCall(player, method, ...args) {
  try {
    if (player && typeof player[method] === "function") {
      return player[method](...args);
    }
  } catch {
    return null;
  }
  return null;
}

export default function YouTubePlayer({
  video = DEFAULT_VIDEO,
  syncState,
  canControl,
  nickname,
  onPlayerReady,
  onLocalPlayback,
  onError
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const suppressEventsRef = useRef(false);
  const lastEventIdRef = useRef(null);
  const currentVideoIdRef = useRef(video.videoId);
  const latestRef = useRef({
    canControl,
    nickname,
    onError,
    onLocalPlayback,
    onPlayerReady,
    syncState,
    video
  });

  useEffect(() => {
    latestRef.current = {
      canControl,
      nickname,
      onError,
      onLocalPlayback,
      onPlayerReady,
      syncState,
      video
    };
  }, [canControl, nickname, onError, onLocalPlayback, onPlayerReady, syncState, video]);

  useEffect(() => {
    let cancelled = false;

    loadYouTubeIframeApi().then((YT) => {
      if (cancelled || playerRef.current) return;

      const latest = latestRef.current;

      playerRef.current = new YT.Player(containerRef.current, {
        videoId: latest.video.videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            const current = latestRef.current;
            currentVideoIdRef.current = current.video.videoId;
            safeCall(event.target, "setVolume", current.syncState?.volume ?? 70);
            safeCall(event.target, "setPlaybackRate", current.syncState?.playbackSpeed ?? 1);
            current.onPlayerReady?.(event.target);
          },
          onStateChange: (event) => {
            const current = latestRef.current;
            if (!current.canControl || suppressEventsRef.current) return;

            const player = event.target;
            const currentTime = safeCall(player, "getCurrentTime") || 0;

            if (event.data === PLAYER_STATES.PLAYING) {
              current.onLocalPlayback?.("video-play", { currentTime });
            }

            if (event.data === PLAYER_STATES.PAUSED) {
              current.onLocalPlayback?.("video-pause", { currentTime });
            }
          },
          onError: () => latestRef.current.onError?.("The YouTube player could not load this video.")
        }
      });
    });

    return () => {
      cancelled = true;
      if (playerRef.current) {
        safeCall(playerRef.current, "destroy");
        playerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !syncState) return;
    if (lastEventIdRef.current === syncState.eventId) return;

    lastEventIdRef.current = syncState.eventId;
    suppressEventsRef.current = true;

    const nextVideo = syncState.currentVideo || video || DEFAULT_VIDEO;
    const nextVideoId = nextVideo.videoId;
    const currentTime = Number(syncState.currentTime || 0);

    if (nextVideoId && currentVideoIdRef.current !== nextVideoId) {
      currentVideoIdRef.current = nextVideoId;
      safeCall(player, "loadVideoById", {
        videoId: nextVideoId,
        startSeconds: currentTime
      });
    } else {
      const localTime = safeCall(player, "getCurrentTime") || 0;
      if (Math.abs(localTime - currentTime) > 1.2) {
        safeCall(player, "seekTo", currentTime, true);
      }
    }

    safeCall(player, "setPlaybackRate", syncState.playbackSpeed || 1);
    safeCall(player, "setVolume", syncState.volume ?? 70);

    window.setTimeout(() => {
      if (syncState.isPlaying) {
        safeCall(player, "playVideo");
      } else {
        safeCall(player, "pauseVideo");
      }

      window.setTimeout(() => {
        suppressEventsRef.current = false;
      }, 650);
    }, 80);
  }, [syncState, video]);

  return (
    <div id="player-shell" className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
      <div ref={containerRef} className="h-full w-full" />
      {!video?.videoId ? (
        <div className="absolute inset-0 grid place-items-center bg-zinc-950">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <AlertTriangle className="h-4 w-4 text-amber-300" aria-hidden="true" />
            No video selected
          </div>
        </div>
      ) : null}
      {!canControl ? (
        <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-white/10 bg-black/55 px-2 py-1 text-xs font-semibold text-zinc-200 backdrop-blur">
          Host controls
        </div>
      ) : null}
      <span className="sr-only">YouTube player controlled by {nickname}</span>
    </div>
  );
}
