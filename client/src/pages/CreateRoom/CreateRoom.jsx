import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { roomsApi } from "../../api/rooms.js";
import Loader from "../../components/Loader/Loader.jsx";
import { saveSession } from "../../utils/session.js";

const schema = z.object({
  name: z.string().min(2, "Room name is required").max(80),
  roomId: z.string().regex(/^[A-Za-z0-9_-]{4,16}$/, "Use 4 to 16 letters, numbers, underscores, or hyphens").optional().or(z.literal("")),
  password: z.string().min(4, "Use at least 4 characters").max(80).optional().or(z.literal("")),
  hostNickname: z.string().min(2, "Nickname is required").max(32),
  visibility: z.enum(["public", "private"]),
  allowEveryoneControls: z.boolean()
});

export default function CreateRoom() {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      roomId: "",
      password: "",
      hostNickname: "",
      visibility: "private",
      allowEveryoneControls: false
    }
  });

  const mutation = useMutation({
    mutationFn: roomsApi.create,
    onSuccess: (room, variables) => {
      saveSession(room.roomId, {
        nickname: variables.hostNickname,
        password: variables.password || ""
      });
      toast.success("Room created");
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
          <p className="label text-blue-200">Create Room</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Set the vibe before everyone arrives</h1>
          <p className="mt-5 text-zinc-400">Choose room access, host identity, and whether guests can control playback.</p>
        </div>

        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="glass-panel rounded-lg p-5 sm:p-6"
        >
          <div className="grid gap-5">
            <label className="space-y-2">
              <span className="label">Room Name</span>
              <input className="field" {...form.register("name")} placeholder="Friday watch party" />
              <FieldError message={form.formState.errors.name?.message} />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="label">Room ID</span>
                <input className="field uppercase" {...form.register("roomId")} placeholder="AUTO" />
                <FieldError message={form.formState.errors.roomId?.message} />
              </label>
              <label className="space-y-2">
                <span className="label">Password</span>
                <input className="field" type="password" {...form.register("password")} placeholder="Optional" />
                <FieldError message={form.formState.errors.password?.message} />
              </label>
            </div>

            <label className="space-y-2">
              <span className="label">Host Nickname</span>
              <input className="field" {...form.register("hostNickname")} placeholder="Ava" />
              <FieldError message={form.formState.errors.hostNickname?.message} />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="label">Room Visibility</span>
                <select className="field" {...form.register("visibility")}>
                  <option className="bg-zinc-950" value="public">
                    Public
                  </option>
                  <option className="bg-zinc-950" value="private">
                    Private
                  </option>
                </select>
              </label>

              <Controller
                name="allowEveryoneControls"
                control={form.control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <span className="label">Playback Control</span>
                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-1">
                      {[
                        ["Host", false],
                        ["Everyone", true]
                      ].map(([label, value]) => (
                        <button
                          key={label}
                          type="button"
                          className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                            field.value === value ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-white/[0.06]"
                          }`}
                          onClick={() => field.onChange(value)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              />
            </div>

            <button type="submit" className="primary-button mt-2" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader label="Generating room" /> : "Generate room"}
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
