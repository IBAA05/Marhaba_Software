import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("h-5 w-5 animate-spin text-gold", className)} />
  );
}

export function FullSpinner({ label }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-brand-muted">
      <Spinner className="h-8 w-8" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
