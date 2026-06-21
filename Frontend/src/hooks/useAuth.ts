import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authApi } from "@/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import { clearRefreshToken, persistRefreshToken } from "@/lib/axios";
import { errorMessage } from "@/lib/queryClient";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (body: { username: string; password: string }) =>
      authApi.login(body),
    onSuccess: (tokens) => {
      setSession({
        user: tokens.user,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
      persistRefreshToken(tokens);
      toast.success(`Welcome back, ${tokens.user.full_name.split(" ")[0]}!`);
      navigate("/dashboard", { replace: true });
    },
    onError: (error) => toast.error(errorMessage(error, "Invalid credentials")),
  });
}

export function useLogout() {
  const { refreshToken, logout } = useAuthStore.getState();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch {
          // ignore network/logout errors; we clear locally regardless
        }
      }
    },
    onSettled: () => {
      logout();
      clearRefreshToken();
      queryClient.clear();
      navigate("/login", { replace: true });
      toast.success("Signed out");
    },
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (user) => {
      setUser(user);
      toast.success("Profile updated");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => toast.success("Password changed"),
  });
}
