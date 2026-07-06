import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, PlayCircle, Radio, ShieldCheck, Sparkles, Users } from "lucide-react";

const features = [
  {
    icon: PlayCircle,
    title: "Frame-tight sync",
    copy: "Playback events use server timestamps, projected time, and guarded client updates."
  },
  {
    icon: MessageCircle,
    title: "Live room chat",
    copy: "Messages, typing, mentions, emoji, GIF links, and room notifications stay in one feed."
  },
  {
    icon: Users,
    title: "Host controls",
    copy: "Transfer host, kick members, mute chat, lock rooms, and choose who can control playback."
  },
  {
    icon: Sparkles,
    title: "Reactions",
    copy: "Animated emoji reactions float above the player without blocking the watch experience."
  }
];

export default function Home() {
  return (
    <main className="overflow-hidden pt-16">
      <section className="relative min-h-[calc(100vh-64px)] border-b border-white/10 bg-[linear-gradient(135deg,#09090B_0%,#111827_46%,#18181B_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(37,99,235,.18),transparent_32%,rgba(124,58,237,.16)_64%,transparent)]" />
        <div className="relative mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-100">
              <Radio className="h-3.5 w-3.5" aria-hidden="true" />
              StreamSphere
            </span>
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">Watch rooms for YouTube nights</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
              Host synchronized YouTube sessions with chat, reactions, member controls, and a collaborative queue that feels polished on every screen.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/create" className="primary-button">
                Create Room
              </Link>
              <Link to="/join" className="secondary-button">
                Join Room
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="glass-panel overflow-hidden rounded-lg"
          >
            <div className="aspect-video bg-black">
              <img
                src="https://i.ytimg.com/vi/jfKfPfyJRdk/maxresdefault.jpg"
                alt="YouTube video playing in a shared StreamSphere room"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid gap-0 border-t border-white/10 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3 p-4">
                {["Ava synced playback", "Mika added a video", "Noah reacted with fire"].map((item) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200">
                    {item}
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 p-4 md:border-l md:border-t-0">
                <div className="mb-3 flex items-center justify-between text-xs text-zinc-400">
                  <span>Members</span>
                  <span>4 online</span>
                </div>
                <div className="space-y-2">
                  {["Ava", "Mika", "Noah", "Sol"].map((name, index) => (
                    <div key={name} className="flex items-center gap-2 rounded-lg bg-white/[0.04] p-2">
                      <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-blue-600 to-emerald-500 text-xs font-bold">
                        {name[0]}
                      </span>
                      <span className="text-sm font-semibold">{name}</span>
                      {index === 0 ? <ShieldCheck className="ml-auto h-4 w-4 text-amber-300" aria-label="Host" /> : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Built for real watch sessions</h2>
            <p className="mt-4 text-zinc-400">Fast rooms, clear controls, and realtime feedback for people who actually hang out online.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  whileHover={{ y: -4 }}
                  className="rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-500/15 text-blue-200">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{feature.copy}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="flow" className="border-t border-white/10 bg-zinc-950 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {["Create a private room", "Search or queue videos", "Watch with everyone in sync"].map((item, index) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <span className="text-sm font-black text-blue-300">0{index + 1}</span>
              <h3 className="mt-3 text-xl font-bold">{item}</h3>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-4 py-8 text-center text-sm text-zinc-500">StreamSphere for synchronized YouTube rooms.</footer>
    </main>
  );
}
