import { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

/** Extract a human-friendly message from an API/Axios error. */
export function errorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      fallback
    );
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000, // lists default: 2 minutes
    },
    mutations: {
      onError: (error) => {
        toast.error(errorMessage(error));
      },
    },
  },
});

/** Stale-time presets per the technical spec. */
export const staleTimes = {
  dashboard: 30 * 1000,
  gantt: 60 * 1000,
  list: 2 * 60 * 1000,
};
