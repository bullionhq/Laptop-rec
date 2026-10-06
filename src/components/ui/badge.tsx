import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RecommendationTier } from "@/lib/types";

type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "minimum"
  | "balanced"
  | "future_proof";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  tier?: RecommendationTier;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "bg-foreground text-background",
  secondary:
    "bg-muted text-foreground dark:bg-white/10 dark:text-white",
  outline:
    "border border-border text-foreground dark:border-white/15",
  minimum:
    "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300 border border-emerald-500/25",
  balanced:
    "bg-indigo-500/15 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300 border border-indigo-500/25",
  future_proof:
    "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300 border border-amber-500/25",
};

const tierLabels: Record<RecommendationTier, string> = {
  minimum: "Minimum",
  balanced: "Balanced",
  future_proof: "Future-proof",
};

export function Badge({
  className,
  variant = "default",
  tier,
  children,
  ...props
}: BadgeProps) {
  const effectiveVariant: BadgeVariant = tier ?? variant;
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
          "leading-normal whitespace-nowrap",
          variantClasses[effectiveVariant],
          className,
        ),
      )}
      {...props}
    >
      {tier ? tierLabels[tier] : children}
    </span>
  );
}
