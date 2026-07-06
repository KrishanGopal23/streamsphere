import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Eye, Plus, Search } from "lucide-react";
import { youtubeApi } from "../../api/youtube.js";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback.js";
import { formatPublished } from "../../utils/formatters.js";
import Loader, { Skeleton } from "../Loader/Loader.jsx";

export default function VideoSearch({ canControl, onSelect, onSuggest }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const updateQuery = useDebouncedCallback(setDebouncedQuery, 400);

  const { data = [], isFetching, isError } = useQuery({
    queryKey: ["youtube-search", debouncedQuery],
    queryFn: () => youtubeApi.search(debouncedQuery),
    enabled: debouncedQuery.trim().length > 1
  });

  const emptyState = useMemo(() => {
    if (!debouncedQuery) return "Search YouTube";
    if (isError) return "Search unavailable";
    if (!isFetching && !data.length) return "No videos found";
    return null;
  }, [data.length, debouncedQuery, isError, isFetching]);

  return (
    <section className="glass-panel flex min-h-0 flex-col rounded-lg">
      <header className="border-b border-white/10 p-3">
        <label className="relative block" htmlFor="video-search">
          <span className="sr-only">Search videos</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            id="video-search"
            className="field pl-10"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              updateQuery(event.target.value);
            }}
            placeholder="Search YouTube"
          />
        </label>
      </header>

      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
        {isFetching ? (
          <div className="space-y-3">
            <Loader label="Searching" />
            {[0, 1, 2].map((item) => (
              <Skeleton key={item} className="h-24" />
            ))}
          </div>
        ) : null}

        {emptyState && !isFetching ? (
          <div className="grid min-h-40 place-items-center text-sm text-zinc-500">{emptyState}</div>
        ) : null}

        <div className="space-y-2">
          {data.map((video) => (
            <article key={video.videoId} className="flex gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-2">
              <button
                type="button"
                className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-zinc-900 text-left"
                onClick={() => (canControl ? onSelect?.(video) : onSuggest?.(video))}
                aria-label={`${canControl ? "Play" : "Suggest"} ${video.title}`}
              >
                <img src={video.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
                {video.duration ? (
                  <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {video.duration}
                  </span>
                ) : null}
              </button>

              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  className="line-clamp-2 text-left text-sm font-semibold leading-snug text-zinc-100 hover:text-blue-200"
                  onClick={() => (canControl ? onSelect?.(video) : onSuggest?.(video))}
                >
                  {video.title}
                </button>
                <p className="mt-1 truncate text-xs text-zinc-400">{video.channel}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                  {video.views ? (
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" aria-hidden="true" />
                      {video.views}
                    </span>
                  ) : null}
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {formatPublished(video.publishedAt)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="icon-button shrink-0"
                onClick={() => (canControl ? onSelect?.(video) : onSuggest?.(video))}
                aria-label={canControl ? "Change video" : "Suggest video"}
                title={canControl ? "Change video" : "Suggest video"}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
