import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import ChatInput from "../ChatInput/ChatInput.jsx";
import { formatClock } from "../../utils/formatters.js";

function renderMessage(message) {
  const parts = message.split(/(@[a-zA-Z0-9_-]+)/g);
  return parts.map((part, index) =>
    part.startsWith("@") ? (
      <span key={`${part}-${index}`} className="rounded bg-blue-500/15 px-1 font-semibold text-blue-200">
        {part}
      </span>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

export default function Chat({
  messages = [],
  nickname,
  typingUsers = [],
  muted,
  onSend,
  onTypingStart,
  onTypingStop
}) {
  const scrollerRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const [unread, setUnread] = useState(0);

  const visibleTyping = useMemo(() => typingUsers.filter((user) => user !== nickname), [typingUsers, nickname]);

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;

    if (atBottom) {
      element.scrollTop = element.scrollHeight;
      setUnread(0);
    } else {
      setUnread((count) => count + 1);
    }
  }, [messages, atBottom]);

  function handleScroll() {
    const element = scrollerRef.current;
    if (!element) return;
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
    const bottom = distance < 80;
    setAtBottom(bottom);
    if (bottom) setUnread(0);
  }

  return (
    <section className="glass-panel relative flex min-h-0 flex-col rounded-lg">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-blue-300" aria-hidden="true" />
          <h2 className="text-sm font-bold">Room Chat</h2>
        </div>
        {unread ? (
          <button
            type="button"
            className="rounded-md bg-blue-500 px-2 py-1 text-xs font-bold text-white"
            onClick={() => {
              scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
              setUnread(0);
              setAtBottom(true);
            }}
          >
            {unread} new
          </button>
        ) : null}
      </header>

      <div ref={scrollerRef} onScroll={handleScroll} className="thin-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {messages.map((item) => {
            const isSelf = item.nickname === nickname;
            const isSystem = item.type === "system";

            return (
              <motion.article
                key={item._id || `${item.nickname}-${item.createdAt}-${item.message}`}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[86%] rounded-lg border px-3 py-2 ${
                    isSystem
                      ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
                      : isSelf
                        ? "border-blue-400/30 bg-blue-500/15 text-blue-50"
                        : "border-white/10 bg-white/[0.05] text-zinc-100"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="truncate text-xs font-bold">{item.nickname}</span>
                    <span className="text-[10px] text-zinc-500">{formatClock(item.createdAt || Date.now())}</span>
                  </div>
                  <p className="break-words text-sm leading-relaxed">{renderMessage(item.message)}</p>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="h-7 border-t border-white/10 px-4 py-1 text-xs text-zinc-500">
        {visibleTyping.length ? `${visibleTyping.slice(0, 2).join(", ")} typing` : muted ? "Chat muted" : "Live"}
      </div>

      <ChatInput disabled={muted} onSend={onSend} onTypingStart={onTypingStart} onTypingStop={onTypingStop} />
    </section>
  );
}
