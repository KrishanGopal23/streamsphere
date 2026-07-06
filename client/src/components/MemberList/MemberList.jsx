import { Crown, MicOff, Signal, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

function fallbackInitial(nickname = "?") {
  return nickname.slice(0, 1).toUpperCase();
}

export default function MemberList({ members = [], hostNickname }) {
  const orderedMembers = [...members].sort((a, b) => (a.joinOrder || 0) - (b.joinOrder || 0));

  return (
    <section className="glass-panel flex min-h-0 flex-col rounded-lg">
      <header className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-bold">Online Members</h2>
      </header>
      <div className="thin-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {orderedMembers.map((member) => (
          <motion.div
            key={member.nickname}
            layout
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3"
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 via-violet-600 to-emerald-500">
              {member.avatar ? (
                <img src={member.avatar} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <span className="grid h-full place-items-center text-sm font-bold">{fallbackInitial(member.nickname)}</span>
              )}
              <span
                className={`absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full border border-zinc-950 ${
                  member.connected ? "bg-emerald-400" : "bg-zinc-500"
                }`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-semibold">{member.nickname}</p>
                {member.nickname === hostNickname ? <Crown className="h-3.5 w-3.5 text-amber-300" aria-label="Host" /> : null}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
                {member.connected ? <Signal className="h-3 w-3" aria-hidden="true" /> : <WifiOff className="h-3 w-3" aria-hidden="true" />}
                <span>#{member.joinOrder || 1}</span>
              </div>
            </div>

            <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.04]" title="Mic placeholder">
              <MicOff className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
