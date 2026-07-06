import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Smile } from "lucide-react";
import EmojiPicker from "../EmojiPicker/EmojiPicker.jsx";
import { useDebouncedCallback } from "../../hooks/useDebouncedCallback.js";

const MAX_LENGTH = 500;

export default function ChatInput({ disabled, onSend, onTypingStart, onTypingStop }) {
  const [message, setMessage] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const stopTyping = useDebouncedCallback(() => {
    onTypingStop?.();
  }, 900);

  const handleChange = useCallback(
    (event) => {
      setMessage(event.target.value.slice(0, MAX_LENGTH));
      onTypingStart?.();
      stopTyping();
    },
    [onTypingStart, stopTyping]
  );

  function submit(event) {
    event.preventDefault();
    const clean = message.trim();
    if (!clean || disabled) return;
    onSend(clean);
    setMessage("");
    setPickerOpen(false);
    onTypingStop?.();
  }

  useEffect(() => () => onTypingStop?.(), [onTypingStop]);

  return (
    <form onSubmit={submit} className="relative border-t border-white/10 p-3">
      <AnimatePresence>
        {pickerOpen ? (
          <motion.div
            className="absolute bottom-20 right-3 z-20"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <EmojiPicker onSelect={(emoji) => setMessage((current) => `${current}${emoji}`.slice(0, MAX_LENGTH))} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <button
          type="button"
          className="icon-button shrink-0"
          onClick={() => setPickerOpen((current) => !current)}
          aria-label="Open emoji picker"
          disabled={disabled}
        >
          <Smile className="h-4 w-4" aria-hidden="true" />
        </button>
        <label className="sr-only" htmlFor="chat-message">
          Message
        </label>
        <textarea
          id="chat-message"
          value={message}
          onChange={handleChange}
          disabled={disabled}
          rows={1}
          maxLength={MAX_LENGTH}
          placeholder={disabled ? "Chat is muted" : "Message the room"}
          className="field min-h-10 resize-none py-2.5"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) submit(event);
          }}
        />
        <button type="submit" className="icon-button shrink-0 border-blue-400/40 bg-blue-500/15" aria-label="Send message" disabled={disabled || !message.trim()}>
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-2 flex justify-end text-[11px] text-zinc-500">
        {message.length}/{MAX_LENGTH}
      </div>
    </form>
  );
}
