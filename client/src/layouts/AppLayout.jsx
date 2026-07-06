import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar.jsx";

export default function AppLayout() {
  const location = useLocation();
  const isRoom = location.pathname.startsWith("/room/");

  return (
    <div className="min-h-screen bg-ink text-zinc-50 antialiased">
      {!isRoom ? <Navbar /> : null}
      <Outlet />
    </div>
  );
}
