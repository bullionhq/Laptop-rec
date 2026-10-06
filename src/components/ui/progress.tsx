import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

export function Progress({
  className,
  value,
  max = 100,
  ...props
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, max > 0 ? (value / max) * 100 : 0));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={twMerge(
        clsx(
          "relative h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10",
          className,
        ),
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-foreground transition-[width,background-color] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export interface StepperProps {
  steps: string[];
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol
      className={twMerge(
        clsx(
          "flex w-full flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-0",
          className,
        ),
      )}
    >
      {steps.map((label, i) => {
        const state =
          i < current ? "done" : i === current ? "active" : "pending";
        const isLast = i === steps.length - 1;
        return (
          <li
            key={label}
            className={clsx(
              "relative flex flex-1 items-start gap-3 md:flex-col md:items-center md:gap-2 md:px-2",
              isLast && "flex-initial md:flex-initial",
            )}
          >
            {!isLast && (
              <div
                aria-hidden
                className="hidden h-px w-full flex-1 self-center bg-black/10 dark:bg-white/10 md:block absolute left-1/2 top-5 md:w-[calc(100%-3rem)]"
              />
            )}
            {!isLast && (
              <div
                aria-hidden
                className="absolute left-[14px] top-8 w-px flex-1 bg-black/10 dark:bg-white/10 md:hidden"
                style={{ height: "calc(100% - 1.25rem)" }}
              />
            )}
            <div
              className={clsx(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors md:h-9 md:w-9",
                state === "done" &&
                  "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                state === "active" &&
                  "border-foreground bg-foreground text-background",
                state === "pending" &&
                  "border-black/10 bg-transparent text-black/50 dark:border-white/15 dark:text-white/40",
              )}
            >
              {state === "done" ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <div className="flex min-w-0 flex-col pt-1 md:items-center md:pt-0 md:text-center">
              <span
                className={clsx(
                  "truncate text-sm font-medium",
                  state === "pending"
                    ? "text-black/50 dark:text-white/40"
                    : "text-foreground",
                )}
              >
                {label}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
