import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { queryClient } from "@/lib/queryClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./index.css";

const toastOptions = {
  position: "top-right" as const,
  duration: 3500,
  style: {
    borderRadius: "10px",
    background: "#FFFFFF",
    color: "#1A1A2E",
    border: "1px solid #E5E7EB",
    fontSize: "14px",
  },
  success: { iconTheme: { primary: "#4ADE80", secondary: "#fff" } },
  error: { iconTheme: { primary: "#F87171", secondary: "#fff" } },
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        <Toaster toastOptions={toastOptions} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
