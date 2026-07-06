import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../utils/cn.js";

export default function Modal({ open, title, children, onClose, className }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose?.();
          }}
        >
          <motion.section
            className={cn("glass-panel max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-lg", className)}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-base font-bold">{title}</h2>
              <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>
            <div className="thin-scrollbar max-h-[calc(90vh-72px)] overflow-y-auto p-5">{children}</div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
