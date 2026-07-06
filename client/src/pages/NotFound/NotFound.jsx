import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#09090B_0%,#111827_46%,#18181B_100%)] px-4 pt-16">
      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-300">404</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight">Room not found</h1>
        <p className="mt-4 text-zinc-400">The page does not exist or the invite link is no longer valid.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="secondary-button">
            Home
          </Link>
          <Link to="/join" className="primary-button">
            Join Room
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
