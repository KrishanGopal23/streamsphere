import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { roomsApi } from "../../api/rooms.js";
import Loader from "../../components/Loader/Loader.jsx";
import { saveSession } from "../../utils/session.js";

const schema = z.object({
  roomId: z.string().min(4, "Room ID is required").max(16),
  password: z.string().max(80).optional().or(z.literal("")),
  nickname: z.string().min(2, "Nickname is required").max(32)
});

export default function JoinRoom() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      roomId: params.get("roomId") || "",
      password: "",
      nickname: ""
    }
  });

  const mutation = useMutation({
    mutationFn: roomsApi.join,
    onSuccess: (room, variables) => {
      saveSession(room.roomId, {
        nickname: variables.nickname,
        password: variables.password || ""
      });
      toast.success("Joined room");
      navigate(`/room/${room.roomId}`);
    }
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#09090B_0%,#111827_46%,#18181B_100%)] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.85fr_1.15fr]"
      >
        <div>
          <p className="label text-blue-200">Join Room</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Drop into a synchronized session</h1>
          <p className="mt-5 text-zinc-400">Enter the room ID, password if required, and a nickname unique to the room.</p>
        </div>

        <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="glass-panel rounded-lg p-5 sm:p-6">
          <div className="grid gap-5">
            <label className="space-y-2">
              <span className="label">Room ID</span>
              <input className="field uppercase" {...form.register("roomId")} placeholder="ABCD1234" />
              <FieldError message={form.formState.errors.roomId?.message} />
            </label>

            <label className="space-y-2">
              <span className="label">Password</span>
              <input className="field" type="password" {...form.register("password")} placeholder="Optional" />
              <FieldError message={form.formState.errors.password?.message} />
            </label>

            <label className="space-y-2">
              <span className="label">Nickname</span>
              <input className="field" {...form.register("nickname")} placeholder="Mika" />
              <FieldError message={form.formState.errors.nickname?.message} />
            </label>

            <button type="submit" className="primary-button mt-2" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader label="Joining" /> : "Join"}
            </button>
          </div>
        </form>
      </motion.section>
    </main>
  );
}

function FieldError({ message }) {
  return message ? <p className="text-xs font-medium text-rose-300">{message}</p> : null;
}
