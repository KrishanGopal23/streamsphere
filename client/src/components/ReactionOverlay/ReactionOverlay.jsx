import { AnimatePresence, motion } from "framer-motion";

export default function ReactionOverlay({ reactions = [], onComplete }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-live="polite">
      <AnimatePresence>
        {reactions.map((reaction) => {
          const lane = reaction.lane ?? 0;
          const left = 8 + ((lane % 6) * 14);

          return (
            <motion.div
              key={reaction.id}
              className="absolute bottom-16 flex min-w-20 flex-col items-center gap-1 rounded-lg border border-white/10 bg-zinc-950/70 px-3 py-2 text-center shadow-2xl backdrop-blur-md"
              style={{ left: `${left}%` }}
              initial={{ y: 60, opacity: 0, scale: 0.7 }}
              animate={{ y: -260, opacity: [0, 1, 1, 0], scale: [0.75, 1.08, 1, 0.9] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.3, ease: "easeOut" }}
              onAnimationComplete={() => onComplete?.(reaction.id)}
            >
              <span className="text-3xl leading-none">{reaction.emoji}</span>
              <span className="max-w-24 truncate text-[11px] font-semibold text-zinc-200">{reaction.nickname}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
