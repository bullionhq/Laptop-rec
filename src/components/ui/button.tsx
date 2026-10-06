import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:bg-foreground/90 focus-visible:ring-foreground/30 shadow-sm",
  secondary:
    "bg-muted text-foreground hover:bg-muted/80 dark:bg-white/10 dark:text-white dark:hover:bg-white/15 focus-visible:ring-foreground/20",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-muted dark:border-white/15 dark:hover:bg-white/5 focus-visible:ring-foreground/20",
  ghost:
    "bg-transparent text-foreground hover:bg-muted dark:hover:bg-white/5 focus-visible:ring-foreground/20",
  destructive:
    "bg-red-600 text-white hover:bg-red-600/90 focus-visible:ring-red-500/30 shadow-sm",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm rounded-md gap-1.5",
  md: "h-10 px-4 text-sm rounded-lg gap-2",
  lg: "h-12 px-6 text-base rounded-lg gap-2",
  icon: "h-10 w-10 rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={twMerge(
          clsx(
            "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:pointer-events-none disabled:opacity-50",
            "select-none",
            variantClasses[variant],
            sizeClasses[size],
            className,
          ),
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
