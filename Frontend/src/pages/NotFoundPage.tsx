import { useNavigate } from "react-router-dom";
import { Hotel, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-brand-bg p-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-brand-ink text-gold">
        <Hotel className="h-12 w-12" />
      </div>
      <p className="font-heading text-6xl font-bold text-brand-ink">404</p>
      <h1 className="font-heading text-xl font-semibold text-brand-ink">
        Page not found
      </h1>
      <p className="max-w-sm text-sm text-brand-muted">
        The page you are looking for has checked out. Let's get you back to the
        lobby.
      </p>
      <Button
        onClick={() => navigate("/dashboard")}
        leftIcon={<ArrowLeft className="h-4 w-4" />}
      >
        Back to Dashboard
      </Button>
    </div>
  );
}
