import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BedDouble,
  CalendarCheck,
  Eye,
  EyeOff,
  Hotel,
  Lock,
  User as UserIcon,
  Users,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useLogin } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

const features = [
  { icon: CalendarCheck, label: "Bookings" },
  { icon: BedDouble, label: "Rooms" },
  { icon: Users, label: "Guests" },
];

export function LoginPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", remember: true },
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = (values: FormValues) => {
    login.mutate(
      { username: values.username, password: values.password },
      {
        onError: () => {
          setShake(true);
          setTimeout(() => setShake(false), 500);
        },
      },
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT brand panel */}
      <div className="relative hidden w-[55%] flex-col justify-between overflow-hidden bg-brand-ink p-12 text-white lg:flex gold-grain">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-brand-ink">
            <Hotel className="h-6 w-6" />
          </div>
          <span className="font-heading text-xl font-bold">Luxe Hotel</span>
        </div>

        <div className="max-w-lg">
          <motion.div
            variants={brandMotion}
            initial="hidden"
            animate="show"
            className="mb-8 flex h-64 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent"
          >
            <Hotel className="h-28 w-28 text-gold/80" />
          </motion.div>
          <h1 className="font-heading text-4xl font-bold leading-tight">
            Manage your property
            <br />
            with <span className="text-gold">elegance</span>
          </h1>
          <p className="mt-3 text-white/60">
            The all-in-one suite for reservations, rooms, guests and revenue.
          </p>
        </div>

        <div className="flex gap-3">
          {features.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
            >
              <f.icon className="h-4 w-4 text-gold" />
              {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT form panel */}
      <div className="flex w-full items-center justify-center bg-white px-6 lg:w-[45%]">
        <motion.div
          variants={formMotion}
          initial="hidden"
          animate="show"
          className={"w-full max-w-sm " + (shake ? "animate-shake" : "")}
        >
          <h2 className="font-heading text-3xl font-bold text-brand-ink">
            Welcome back
          </h2>
          <p className="mt-1 text-brand-muted">
            Sign in to your hotel dashboard
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <Input
              label="Username"
              placeholder="admin"
              leftIcon={<UserIcon className="h-4 w-4" />}
              error={errors.username?.message}
              {...register("username")}
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="pointer-events-auto"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              error={errors.password?.message}
              {...register("password")}
            />

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-gold accent-gold focus:ring-gold"
                {...register("remember")}
              />
              Remember me
            </label>

            <Button
              type="submit"
              className="w-full justify-center"
              size="lg"
              loading={login.isPending}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-brand-muted">
            Default seed login: <span className="font-medium">admin</span> /
            your configured password
          </p>
        </motion.div>
      </div>
    </div>
  );
}

const brandMotion = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};
const formMotion = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
};
