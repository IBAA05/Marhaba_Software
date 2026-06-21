import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-bg p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-status-danger/10 text-status-danger">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-xl font-bold text-brand-ink">
            Something went wrong
          </h1>
          <p className="max-w-md text-sm text-brand-muted">
            {this.state.message ?? "An unexpected error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-brand-ink hover:bg-gold-dark"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
