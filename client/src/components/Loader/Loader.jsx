import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn.js";

export default function Loader({ label = "Loading", className }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 text-sm text-zinc-300", className)} role="status">
      <Loader2 className="h-5 w-5 animate-spin text-blue-400" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-lg bg-white/[0.07]", className)} aria-hidden="true" />;
}
