import { forwardRef } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
}

const baseField =
  "w-full rounded-lg border border-brand-border bg-white px-3 py-2 text-sm text-brand-ink placeholder:text-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gold disabled:bg-gray-50 dark:bg-dark-card dark:text-gray-100 dark:border-white/10";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightElement, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              baseField,
              leftIcon && "pl-10",
              rightElement && "pr-10",
              error && "border-status-danger focus:ring-status-danger",
              className,
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightElement}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-status-danger">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            baseField,
            "min-h-[90px] resize-y",
            error && "border-status-danger",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-status-danger">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
