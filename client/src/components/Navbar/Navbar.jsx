import { Link, NavLink } from "react-router-dom";
import { LogIn, Plus } from "lucide-react";
import { cn } from "../../utils/cn.js";
import logo from "../../assets/logo.svg";

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Primary">
        <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="StreamSphere Logo"
                className="h-10 w-10"
            />

            <span className="text-lg font-extrabold tracking-tight">
            StreamSphere
            </span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {[
            ["Features", "/#features"],
            ["How it works", "/#flow"]
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/join"
            className={({ isActive }) =>
              cn("secondary-button hidden px-3 py-2 sm:inline-flex", isActive && "border-blue-400/50 bg-blue-500/10")
            }
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Join
          </NavLink>
          <NavLink
            to="/create"
            className={({ isActive }) =>
              cn("primary-button px-3 py-2", isActive && "from-blue-500 to-violet-500")
            }
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
