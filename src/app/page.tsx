"use client";

import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { QuestionnaireForm } from "@/components/questionnaire/QuestionnaireForm";
import { RecommendationResults } from "@/components/results/RecommendationResults";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RecommendationResult, Requirements } from "@/lib/types";

type View = "form" | "results";

export default function Home() {
  const [view, setView] = React.useState<View>("form");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<RecommendationResult | null>(null);
  const [requirements, setRequirements] = React.useState<Requirements | null>(null);
  const [resetKey, setResetKey] = React.useState(0);

  const startOver = React.useCallback(() => {
    setResult(null);
    setRequirements(null);
    setError(null);
    setLoading(false);
    setResetKey((k) => k + 1);
    setView("form");
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-12 sm:py-16">
      <PageHeader view={view} onStartOver={startOver} hasResult={!!result} />

      <section className="w-full space-y-8">
        {error && view === "form" && (
          <StatusError
            error={error}
            onDismiss={() => setError(null)}
          />
        )}

        <div
          className={twMerge(
            clsx(
              "transition-opacity duration-200",
              loading && view === "form" ? "pointer-events-none opacity-70" : "",
            ),
          )}
        >
          {view === "form" && (
            <QuestionnaireForm
              hideResult
              hideInlineError
              disabled={loading}
              resetKey={resetKey}
              onSubmitStart={() => {
                setLoading(true);
                setError(null);
              }}
              onSubmitError={(message) => {
                setError(message);
              }}
              onSubmitSettled={() => {
                setLoading(false);
              }}
              onResult={(r, req) => {
                setResult(r);
                setRequirements(req);
                setView("results");
              }}
            />
          )}

          {view === "results" && result && (
            <RecommendationResults
              result={result}
              onStartOver={startOver}
              className="space-y-6"
            />
          )}

          {view === "results" && !result && !loading && (
            <Card>
              <CardContent className="pt-6 text-sm">
                <p className="font-medium">No recommendation data to show.</p>
                <p className="mt-1 text-black/60 dark:text-white/60">
                  Start the questionnaire from the beginning to generate results.
                </p>
                <div className="mt-4">
                  <Button variant="outline" onClick={startOver}>
                    Start over
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <footer className="mt-16 text-xs text-black/40 dark:text-white/40">
        {view === "results" && requirements && (
          <RequirementsSummary requirements={requirements} />
        )}
      </footer>
    </main>
  );
}

function PageHeader({
  view,
  onStartOver,
  hasResult,
}: {
  view: View;
  onStartOver: () => void;
  hasResult: boolean;
}) {
  return (
    <header className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div className="space-y-3">
        <span className="inline-flex items-center rounded-full bg-zinc-900/5 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
          Phase 2
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Laptop Recommendation Engine
          </h1>
          <p className="mt-2 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
            {view === "form"
              ? "Answer a few quick questions and we'll surface three tiers of laptops tailored to how you'll actually use it."
              : hasResult
                ? "Here are your tailored recommendations across minimum, balanced, and future-proof tiers."
                : "Almost there."}
          </p>
        </div>
      </div>
      {view === "results" && (
        <Button variant="outline" onClick={onStartOver} size="md">
          Start over
        </Button>
      )}
    </header>
  );
}

function StatusError({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  return (
    <Card
      role="alert"
      className="border-red-500/40 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 dark:border-red-500/30"
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">We couldn&apos;t finish that request.</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function RequirementsSummary({ requirements }: { requirements: Requirements }) {
  const parts: string[] = [];
  if (requirements.use_cases?.length) {
    parts.push(requirements.use_cases.join(" · "));
  }
  if (requirements.screen_pref) parts.push(requirements.screen_pref);
  if (requirements.portability) parts.push(requirements.portability);
  if (requirements.os_pref) parts.push(requirements.os_pref);
  if (requirements.performance) parts.push(requirements.performance);
  if (parts.length === 0) return null;
  return (
    <p>
      <span className="font-medium">Based on:</span> {parts.join("  /  ")}.
    </p>
  );
}
