import Picker, { Theme } from "emoji-picker-react";

export default function EmojiPicker({ onSelect }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950 shadow-2xl">
      <Picker
        theme={Theme.DARK}
        lazyLoadEmojis
        previewConfig={{ showPreview: false }}
        onEmojiClick={(emoji) => onSelect?.(emoji.emoji)}
      />
    </div>
  );
}
