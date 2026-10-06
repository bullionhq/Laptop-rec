"use client";

import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type {
  Laptop,
  RecommendationResult,
  RecommendationTier,
} from "@/lib/types";

export interface RecommendationResultsProps {
  result: RecommendationResult;
  onStartOver?: () => void;
  className?: string;
}

const TIER_ORDER: Array<{
  tier: RecommendationTier;
  title: string;
  eyebrow: string;
  pick: (r: RecommendationResult) => Laptop | null;
}> = [
  {
    tier: "minimum",
    title: "Minimum",
    eyebrow: "Gets the job done",
    pick: (r) => r.minimum,
  },
  {
    tier: "balanced",
    title: "Balanced",
    eyebrow: "Best overall pick",
    pick: (r) => r.balanced,
  },
  {
    tier: "future_proof",
    title: "Future-proof",
    eyebrow: "Built to last",
    pick: (r) => r.future_proof,
  },
];

export function RecommendationResults({
  result,
  onStartOver,
  className,
}: RecommendationResultsProps) {
  return (
    <section
      className={twMerge(clsx("w-full space-y-8", className))}
      aria-label="Recommendation results"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Results
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Three laptops for you
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-black/60 dark:text-white/60">
            Picked and ranked by how well the use-cases match what you said you&apos;d use the laptop for.
          </p>
        </div>
        {onStartOver && (
          <Button
            variant="outline"
            onClick={onStartOver}
            type="button"
            size="md"
          >
            Start over
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TIER_ORDER.map(({ tier, title, eyebrow, pick }) => {
          const laptop = pick(result);
          return (
            <ResultCard
              key={tier}
              tier={tier}
              title={title}
              eyebrow={eyebrow}
              laptop={laptop}
            />
          );
        })}
      </div>
    </section>
  );
}

interface ResultCardProps {
  tier: RecommendationTier;
  title: string;
  eyebrow: string;
  laptop: Laptop | null;
}

function ResultCard({ tier, title, eyebrow, laptop }: ResultCardProps) {
  if (!laptop) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
                {eyebrow}
              </p>
              <p className="mt-0.5 text-lg font-semibold">{title}</p>
            </div>
            <Badge tier={tier}>{title}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-dashed border-black/10 text-sm text-black/50 dark:border-white/10 dark:text-white/40">
            No match found
          </div>
          <p className="mt-4 text-sm text-black/60 dark:text-white/60">
            We couldn&apos;t find a laptop that fits this tier with your current
            answers. Try relaxing some preferences.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={twMerge(
        clsx(
          "flex flex-col overflow-hidden transition-shadow hover:shadow-md",
          tier === "balanced" && "ring-1 ring-foreground/10",
        ),
      )}
    >
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
              {eyebrow}
            </p>
            <p className="mt-0.5 text-lg font-semibold">{title}</p>
          </div>
          <Badge tier={tier}>{title}</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-5 pt-6">
        <div className="overflow-hidden rounded-lg border border-black/5 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
          <img
            src={laptop.image_url ?? undefined}
            alt={`${laptop.brand} ${laptop.name}`}
            className="aspect-[4/3] w-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent && !parent.querySelector("[data-empty]")) {
                const fallback = document.createElement("div");
                fallback.setAttribute("data-empty", "true");
                fallback.className =
                  "flex aspect-[4/3] w-full items-center justify-center text-sm text-black/40 dark:text-white/40";
                fallback.textContent = `${laptop.brand} ${laptop.name}`;
                parent.appendChild(fallback);
              }
            }}
          />
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
            {laptop.brand}
          </p>
          <h3 className="mt-0.5 text-xl font-semibold leading-tight">
            {laptop.name}
          </h3>
          <p className="mt-1 text-lg font-semibold tracking-tight text-foreground">
            ${laptop.price.toLocaleString()}
          </p>
        </div>

        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
          <Spec label="CPU" value={laptop.cpu} />
          <Spec label="GPU" value={laptop.gpu} />
          <Spec label="RAM" value={laptop.ram_gb != null ? `${laptop.ram_gb} GB` : null} />
          <Spec
            label="Storage"
            value={laptop.storage_gb != null ? formatStorage(laptop.storage_gb) : null}
          />
          <Spec
            label="Screen"
            value={
              laptop.screen_size != null || laptop.screen_type
                ? [
                    laptop.screen_size != null ? `${laptop.screen_size}"` : null,
                    laptop.screen_type,
                  ]
                    .filter(Boolean)
                    .join(" · ") || null
                : null
            }
          />
          <Spec
            label="Weight"
            value={laptop.weight_kg != null ? `${laptop.weight_kg} kg` : null}
          />
          <Spec
            label="Battery"
            value={laptop.battery_hours != null ? `${laptop.battery_hours} h` : null}
          />
          <Spec label="OS" value={laptop.os} />
        </dl>

        {laptop.notes && (
          <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
            {laptop.notes}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {laptop.buy_url ? (
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => window.open(laptop.buy_url!, "_blank", "noopener,noreferrer")}
            type="button"
            asChild={false}
          >
            Buy · ${laptop.price.toLocaleString()}
          </Button>
        ) : (
          <Button variant="secondary" size="md" className="w-full" disabled>
            No purchase link available
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function Spec({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col items-start border-t border-black/5 pt-2 first:border-t-0 sm:border-t-0 dark:border-white/10">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-foreground">
        {value ? (
          <span className="line-clamp-2">{value}</span>
        ) : (
          <span className="text-black/40 dark:text-white/30">—</span>
        )}
      </dd>
    </div>
  );
}

function formatStorage(gb: number): string {
  if (gb >= 1024) {
    const tb = gb / 1024;
    return Number.isInteger(tb) ? `${tb} TB` : `${tb.toFixed(1)} TB`;
  }
  return `${gb} GB`;
}
