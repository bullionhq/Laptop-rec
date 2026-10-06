"use client";

import * as React from "react";
import { z } from "zod";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/progress";
import type {
  RecommendationResult,
  Requirements,
} from "@/lib/types";
import { getRecommendationsAction } from "@/app/actions/recommendations";
import { RecommendationResults } from "@/components/results/RecommendationResults";

type Option<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
  hint?: string;
};

const USE_CASE_OPTIONS: Option[] = [
  { value: "student", label: "Student", description: "Notes, research, papers" },
  { value: "office", label: "Office / Business", description: "Email, spreadsheets, meetings" },
  { value: "web", label: "Web browsing", description: "General everyday browsing" },
  { value: "content", label: "Content creation", description: "Writing, blog, social media" },
  { value: "media", label: "Media consumption", description: "Movies, shows, music" },
  { value: "gaming_light", label: "Light gaming", description: "Indie / casual games" },
  { value: "gaming", label: "Gaming", description: "AAA titles, 1080p+" },
  { value: "creator", label: "Creator", description: "Photo / audio editing" },
  { value: "video_editing", label: "Video editing", description: "Premiere, DaVinci, etc." },
  { value: "3d", label: "3D / CAD", description: "Blender, SolidWorks" },
  { value: "developer", label: "Developer", description: "IDE, containers, VMs" },
  { value: "ml_light", label: "Light ML", description: "Notebooks, inference" },
  { value: "ml", label: "Local ML", description: "Fine-tuning, larger models" },
  { value: "tinkerer", label: "Tinkerer", description: "Linux, upgrades, DIY" },
  { value: "travel", label: "Frequent travel", description: "Lightweight, battery focus" },
  { value: "business", label: "Executive / Pro", description: "Premium build, keyboard, security" },
];

const SCREEN_OPTIONS: Option[] = [
  { value: "small", label: "Compact (13\" or less)", hint: "Highly portable" },
  { value: "medium", label: "Balanced (14\"–15\")", hint: "The sweet spot" },
  { value: "large", label: "Large (16\"+)", hint: "Media & productivity" },
  { value: "any", label: "No preference" },
];

const PORTABILITY_OPTIONS: Option[] = [
  { value: "travel", label: "Very important", description: "Light & long battery, every day on the go" },
  { value: "balanced", label: "Balanced", description: "Trade-offs are fine either way" },
  { value: "desk", label: "Not important", description: "Mostly desk-bound, power preferred" },
];

const OS_OPTIONS: Option[] = [
  { value: "macOS", label: "macOS", hint: "Apple ecosystem" },
  { value: "Windows", label: "Windows", hint: "Broad compatibility" },
  { value: "any", label: "Either / no preference" },
];

const PERFORMANCE_OPTIONS: Option[] = [
  { value: "basic", label: "Basic", description: "Web, email, docs" },
  { value: "balanced", label: "Balanced", description: "Everyday + light creation" },
  { value: "high", label: "High", description: "Creator, dev, light gaming" },
  { value: "max", label: "Maximum", description: "AAA gaming / ML / 8K video" },
];

const STEP_LABELS = [
  "Use cases",
  "Screen",
  "Portability",
  "OS",
  "Performance",
  "Summary",
] as const;

const step0Schema = z.object({
  use_cases: z
    .array(z.string())
    .min(1, "Pick at least one use case"),
});

const step1Schema = z.object({
  screen_pref: z.string().min(1, "Pick a screen preference"),
});

const step2Schema = z.object({
  portability: z.string().min(1, "Pick a portability preference"),
});

const step3Schema = z.object({
  os_pref: z.string().min(1, "Pick an OS preference"),
});

const step4Schema = z.object({
  performance: z.string().min(1, "Pick a performance level"),
});

type FormState = {
  use_cases: string[];
  screen_pref: string;
  portability: string;
  os_pref: string;
  performance: string;
};

const initialState: FormState = {
  use_cases: [],
  screen_pref: "",
  portability: "",
  os_pref: "",
  performance: "",
};

function requirementsFromState(state: FormState): Requirements {
  return {
    use_cases: state.use_cases,
    budget_min: 0,
    budget_max: 99999,
    screen_pref: state.screen_pref,
    portability: state.portability,
    os_pref: state.os_pref,
    performance: state.performance,
  };
}

export interface QuestionnaireFormProps {
  onResult?: (result: RecommendationResult, requirements: Requirements) => void;
  onSubmitStart?: () => void;
  onSubmitError?: (message: string) => void;
  onSubmitSettled?: () => void;
  disabled?: boolean;
  hideResult?: boolean;
  hideInlineError?: boolean;
  resetKey?: number | string;
}

export function QuestionnaireForm({
  onResult,
  onSubmitStart,
  onSubmitError,
  onSubmitSettled,
  disabled,
  hideResult,
  hideInlineError,
  resetKey,
}: QuestionnaireFormProps) {
  const [step, setStep] = React.useState(0);
  const [state, setState] = React.useState<FormState>(initialState);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<RecommendationResult | null>(null);

  const resetFlow = React.useCallback(() => {
    setState(initialState);
    setErrors({});
    setSubmitError(null);
    setResult(null);
    setStep(0);
  }, []);

  React.useEffect(() => {
    resetFlow();
  }, [resetKey, resetFlow]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState((s) => ({ ...s, [key]: value }));
    if (errors[key as string]) {
      setErrors((e) => {
        const next = { ...e };
        delete next[key as string];
        return next;
      });
    }
  };

  const toggleUseCase = (value: string) => {
    const next = state.use_cases.includes(value)
      ? state.use_cases.filter((v) => v !== value)
      : [...state.use_cases, value];
    update("use_cases", next);
  };

  const validateStep = (idx: number): boolean => {
    const schemas = [
      step0Schema,
      step1Schema,
      step2Schema,
      step3Schema,
      step4Schema,
    ];
    if (idx === STEP_LABELS.length - 1) return true;
    const schema = schemas[idx];
    const parsed = schema.safeParse(state);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const flat: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (!flat[key]) flat[key] = issue.message;
    }
    setErrors(flat);
    return false;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    if (step < STEP_LABELS.length - 1) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 0) {
      setErrors({});
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(0) || !validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    onSubmitStart?.();
    try {
      const requirements = requirementsFromState(state);
      const r = await getRecommendationsAction(requirements);
      setResult(r);
      onResult?.(r, requirements);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setSubmitError(message);
      onSubmitError?.(message);
    } finally {
      setSubmitting(false);
      onSubmitSettled?.();
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="px-2">
        <Stepper steps={[...STEP_LABELS]} current={step} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEP_LABELS[step]}</CardTitle>
          {step === 0 && (
            <CardDescription>
              Pick one or more things you&apos;ll use the laptop for most.
            </CardDescription>
          )}
          {step === 1 && (
            <CardDescription>Choose a general screen size category.</CardDescription>
          )}
          {step === 2 && (
            <CardDescription>How important is weight and battery?</CardDescription>
          )}
          {step === 3 && <CardDescription>Pick a platform.</CardDescription>}
          {step === 4 && <CardDescription>How much horsepower?</CardDescription>}
          {step === 5 && (
            <CardDescription>
              Review your answers, then submit to see recommendations.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <StepUseCases
              selected={state.use_cases}
              onToggle={toggleUseCase}
              error={errors["use_cases"]}
            />
          )}
          {step === 1 && (
            <StepSingleOption
              options={SCREEN_OPTIONS}
              value={state.screen_pref}
              onChange={(v) => update("screen_pref", v)}
              error={errors["screen_pref"]}
            />
          )}
          {step === 2 && (
            <StepSingleOption
              options={PORTABILITY_OPTIONS}
              value={state.portability}
              onChange={(v) => update("portability", v)}
              error={errors["portability"]}
            />
          )}
          {step === 3 && (
            <StepSingleOption
              options={OS_OPTIONS}
              value={state.os_pref}
              onChange={(v) => update("os_pref", v)}
              error={errors["os_pref"]}
            />
          )}
          {step === 4 && (
            <StepSingleOption
              options={PERFORMANCE_OPTIONS}
              value={state.performance}
              onChange={(v) => update("performance", v)}
              error={errors["performance"]}
            />
          )}
          {step === 5 && (
            <Summary state={state} />
          )}
        </CardContent>
        <CardFooter
          className={clsx(
            "flex gap-2 border-t border-black/5 pt-6",
            "dark:border-white/10",
            step === 0 ? "justify-end" : "justify-between",
          )}
        >
          {step > 0 && (
            <Button variant="outline" onClick={goBack} disabled={submitting || disabled}>
              Back
            </Button>
          )}
          {step < STEP_LABELS.length - 1 ? (
            <Button variant="primary" onClick={goNext} disabled={submitting || disabled}>
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting || disabled}
              type="button"
            >
              {submitting ? "Finding matches…" : "Get recommendations"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {submitting && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
            Running the scoring engine…
          </CardContent>
        </Card>
      )}

      {!hideInlineError && submitError && !submitting && (
        <Card className="border-red-500/40 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300 dark:border-red-500/30">
          <CardContent className="pt-6 text-sm">
            <strong>Something went wrong.</strong> {submitError}
          </CardContent>
        </Card>
      )}

      {!hideResult && result && !submitting && (
        <RecommendationResults
          result={result}
          onStartOver={resetFlow}
        />
      )}
    </div>
  );
}

function baseChoiceCard(active: boolean, disabled?: boolean) {
  return twMerge(
    clsx(
      "group relative flex cursor-pointer select-none flex-col gap-1 rounded-lg border p-4 text-left transition-all",
      "focus-within:ring-2 focus-within:ring-foreground/20 focus-within:ring-offset-2 focus-within:ring-offset-background",
      "border-black/10 bg-white dark:border-white/10 dark:bg-white/[0.03]",
      "hover:border-black/20 dark:hover:border-white/20",
      active && [
        "border-foreground shadow-sm",
        "ring-2 ring-foreground/15 ring-offset-2 ring-offset-background",
      ],
      disabled && "opacity-60 pointer-events-none",
    ),
  );
}

function StepUseCases({
  selected,
  onToggle,
  error,
}: {
  selected: string[];
  onToggle: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-4">
      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASE_OPTIONS.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={baseChoiceCard(active)}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={active}
                onChange={() => onToggle(opt.value)}
              />
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{opt.label}</span>
                <span
                  className={clsx(
                    "flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-black/20 dark:border-white/20",
                  )}
                  aria-hidden
                >
                  {active && (
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
              </span>
              {opt.description && (
                <span className="text-xs text-black/60 dark:text-white/60">
                  {opt.description}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function StepSingleOption({
  options,
  value,
  onChange,
  error,
}: {
  options: Option[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-4">
      {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <label
              key={opt.value}
              className={baseChoiceCard(active)}
            >
              <input
                type="radio"
                className="sr-only"
                checked={active}
                onChange={() => onChange(opt.value)}
              />
              <span className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">{opt.label}</span>
                <span
                  className={clsx(
                    "h-4 w-4 rounded-full border transition-colors",
                    active
                      ? "border-foreground ring-4 ring-foreground/15"
                      : "border-black/20 dark:border-white/20",
                  )}
                  aria-hidden
                >
                  {active && (
                    <span className="block h-full w-full rounded-full bg-foreground" />
                  )}
                </span>
              </span>
              {opt.description && (
                <span className="text-xs text-black/60 dark:text-white/60">
                  {opt.description}
                </span>
              )}
              {opt.hint && !opt.description && (
                <span className="text-xs text-black/50 dark:text-white/40">
                  {opt.hint}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-black/5 last:border-b-0 dark:border-white/10">
      <span className="text-sm font-medium text-black/60 dark:text-white/60 w-32 shrink-0">
        {label}
      </span>
      <span className="text-sm text-foreground text-right">{value}</span>
    </div>
  );
}

function describeOptions(values: string[], options: Option[]) {
  const set = new Set(values);
  return options.filter((o) => set.has(o.value)).map((o) => o.label);
}

function Summary({ state }: { state: FormState }) {
  const useCaseLabels = describeOptions(state.use_cases, USE_CASE_OPTIONS);
  const screenLabel = SCREEN_OPTIONS.find((o) => o.value === state.screen_pref)?.label;
  const portLabel = PORTABILITY_OPTIONS.find((o) => o.value === state.portability)?.label;
  const osLabel = OS_OPTIONS.find((o) => o.value === state.os_pref)?.label;
  const perfLabel = PERFORMANCE_OPTIONS.find((o) => o.value === state.performance)?.label;
  return (
    <div>
      <SummaryRow
        label="Use cases"
        value={
          useCaseLabels.length ? (
            <span className="flex flex-wrap justify-end gap-1.5">
              {useCaseLabels.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-foreground dark:bg-white/10"
                >
                  {l}
                </span>
              ))}
            </span>
          ) : (
            "—"
          )
        }
      />
      <SummaryRow label="Screen" value={screenLabel || "—"} />
      <SummaryRow label="Portability" value={portLabel || "—"} />
      <SummaryRow label="OS" value={osLabel || "—"} />
      <SummaryRow label="Performance" value={perfLabel || "—"} />
    </div>
  );
}


