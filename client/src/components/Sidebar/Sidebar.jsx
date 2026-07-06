import { Clapperboard, MessageCircle, Radio, Settings, Users } from "lucide-react";
import { cn } from "../../utils/cn.js";

const items = [
  { id: "watch", icon: Clapperboard, label: "Watch" },
  { id: "chat", icon: MessageCircle, label: "Chat" },
  { id: "members", icon: Users, label: "Members" },
  { id: "settings", icon: Settings, label: "Settings" }
];

export default function Sidebar({ active = "watch", onSelect, connectionStatus }) {
  return (
    <aside className="glass-panel flex items-center justify-between rounded-lg px-2 py-2 lg:h-full lg:w-16 lg:flex-col">
      <div className="flex items-center gap-2 lg:flex-col">
        <div className="hidden h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 lg:grid">
          <Radio className="h-5 w-5" aria-hidden="true" />
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect?.(item.id)}
              className={cn("icon-button", active === item.id && "border-blue-400/60 bg-blue-500/15 text-blue-100")}
              aria-label={item.label}
              title={item.label}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          );
        })}
      </div>
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          connectionStatus === "connected" && "bg-emerald-400",
          connectionStatus === "reconnecting" && "bg-amber-400",
          connectionStatus !== "connected" && connectionStatus !== "reconnecting" && "bg-rose-400"
        )}
        title={`Socket ${connectionStatus}`}
      />
    </aside>
  );
}
