import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import AppLayout from "../layouts/AppLayout.jsx";
import Loader from "../components/Loader/Loader.jsx";

const Home = lazy(() => import("../pages/Home/Home.jsx"));
const CreateRoom = lazy(() => import("../pages/CreateRoom/CreateRoom.jsx"));
const JoinRoom = lazy(() => import("../pages/JoinRoom/JoinRoom.jsx"));
const Room = lazy(() => import("../pages/Room/Room.jsx"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound.jsx"));

export default function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loader label="Loading page" className="min-h-screen bg-ink" />}>
        <Routes location={location} key={location.pathname}>
          <Route element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="/create" element={<CreateRoom />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/room/:roomId" element={<Room />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}
