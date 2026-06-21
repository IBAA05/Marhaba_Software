import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera } from "lucide-react";
import { Avatar, Button, Card, CardHeader, Input } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { useChangePassword, useUpdateProfile } from "@/hooks/useAuth";
import { humanize } from "@/lib/utils";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
});
const passwordSchema = z
  .object({
    old_password: z.string().min(1, "Current password required"),
    new_password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.new_password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
    },
  });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { old_password: "", new_password: "", confirm: "" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="flex items-center gap-5">
        <div className="relative">
          <Avatar name={user?.full_name} src={user?.avatar_url} size="xl" />
          <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-brand-ink shadow">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-brand-ink dark:text-gray-100">
            {user?.full_name}
          </h2>
          <p className="text-sm text-brand-muted">
            {user?.email} · {humanize(user?.role)}
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Personal Information" />
        <form
          onSubmit={profileForm.handleSubmit((v) => updateProfile.mutate(v))}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Full Name"
              error={profileForm.formState.errors.full_name?.message}
              {...profileForm.register("full_name")}
            />
            <Input
              label="Username"
              value={user?.username ?? ""}
              disabled
              readOnly
            />
          </div>
          <Input
            label="Email"
            error={profileForm.formState.errors.email?.message}
            {...profileForm.register("email")}
          />
          <div className="flex justify-end">
            <Button type="submit" loading={updateProfile.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Change Password" />
        <form
          onSubmit={passwordForm.handleSubmit((v) =>
            changePassword.mutate(
              { old_password: v.old_password, new_password: v.new_password },
              { onSuccess: () => passwordForm.reset() },
            ),
          )}
          className="space-y-4"
        >
          <Input
            label="Current Password"
            type="password"
            error={passwordForm.formState.errors.old_password?.message}
            {...passwordForm.register("old_password")}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              error={passwordForm.formState.errors.new_password?.message}
              {...passwordForm.register("new_password")}
            />
            <Input
              label="Confirm Password"
              type="password"
              error={passwordForm.formState.errors.confirm?.message}
              {...passwordForm.register("confirm")}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" loading={changePassword.isPending}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
