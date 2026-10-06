import type {
  Laptop,
  Requirements,
  RecommendationResult,
  ScoredLaptop,
  RecommendationTier,
} from "@/lib/types";

function computeUseCaseMatch(laptop: Laptop, requirements: Requirements): number {
  const userCases = requirements.use_cases;
  if (!userCases || userCases.length === 0) return 100;

  const laptopCases = new Set(laptop.use_cases ?? []);
  let hits = 0;
  for (const uc of userCases) {
    if (laptopCases.has(uc)) hits++;
  }
  const coverage = hits / userCases.length;
  let base = coverage * 100;
  if (coverage >= 1) base += 15;
  return Math.min(100, base);
}

function mapOsPref(pref: string): string[] {
  const p = pref.toLowerCase().trim();
  if (p === "mac" || p === "macos" || p === "apple") return ["macOS"];
  if (p === "windows" || p === "pc") return ["Windows 11", "Windows"];
  return [];
}

function computeOsMatch(laptop: Laptop, requirements: Requirements): number {
  const wanted = mapOsPref(requirements.os_pref);
  if (wanted.length === 0) return 1;
  const os = laptop.os ?? "";
  return wanted.some((w) => os.toLowerCase().includes(w.toLowerCase())) ? 1 : 0;
}

function screenSizeBucket(size: number | null): string {
  if (size == null) return "medium";
  if (size < 13.5) return "small";
  if (size > 15.5) return "large";
  return "medium";
}

function computeScreenMatch(laptop: Laptop, requirements: Requirements): number {
  const pref = requirements.screen_pref.toLowerCase().trim();
  if (!pref || pref === "any" || pref === "no preference") return 1;
  const bucket = screenSizeBucket(laptop.screen_size);
  if (pref.includes(bucket)) return 1;
  if (pref.includes("13") && bucket === "small") return 1;
  if ((pref.includes("14") || pref.includes("15")) && bucket === "medium") return 1;
  if (pref.includes("16") && bucket === "large") return 1;
  return 0;
}

function computePortabilityMatch(laptop: Laptop, requirements: Requirements): number {
  const pref = requirements.portability.toLowerCase().trim();
  if (!pref || pref === "any" || pref.includes("balanced")) return 0.5;
  const pScore = laptop.portability_score ?? 50;
  if (pref.includes("travel") || pref.includes("light") || pref.includes("portable")) {
    return Math.max(0, Math.min(1, (pScore - 50) / 50));
  }
  if (pref.includes("desk") || pref.includes("replace") || pref.includes("heavy")) {
    return Math.max(0, Math.min(1, (100 - pScore) / 50));
  }
  return 0.5;
}

function computePerformanceAlignment(laptop: Laptop, requirements: Requirements): number {
  const pref = requirements.performance.toLowerCase().trim();
  const pScore = laptop.performance_score ?? 50;
  if (pref.includes("basic") || pref.includes("light") || pref.includes("entry")) {
    if (pScore >= 40 && pScore <= 70) return 1;
    if (pScore > 90) return 0.2;
    return 0.6;
  }
  if (pref.includes("high") || pref.includes("max") || pref.includes("creator") || pref.includes("gaming")) {
    if (pScore >= 80) return 1;
    return 0.5;
  }
  if (pScore >= 60 && pScore <= 85) return 1;
  return 0.7;
}

function computeSecondaryScore(laptop: Laptop, requirements: Requirements): number {
  const os = computeOsMatch(laptop, requirements);
  const screen = computeScreenMatch(laptop, requirements);
  const port = computePortabilityMatch(laptop, requirements);
  const perf = computePerformanceAlignment(laptop, requirements);
  const avg = (os * 30 + screen * 25 + port * 25 + perf * 20) / 100;
  return avg * 100;
}

function computeCombinedScore(laptop: Laptop, requirements: Requirements): number {
  const uc = computeUseCaseMatch(laptop, requirements);
  const sec = computeSecondaryScore(laptop, requirements);
  return uc * 0.95 + sec * 0.05;
}

export function getRecommendations(
  laptops: Laptop[],
  requirements: Requirements,
): RecommendationResult {
  if (!laptops || laptops.length === 0) {
    return { minimum: null, balanced: null, future_proof: null };
  }

  const scored = laptops.map<ScoredLaptop>((l) => ({
    ...l,
    score: computeCombinedScore(l, requirements),
  }));

  scored.sort((a, b) => {
    const ucA = computeUseCaseMatch(a, requirements);
    const ucB = computeUseCaseMatch(b, requirements);
    if (ucB !== ucA) return ucB - ucA;
    const secA = computeSecondaryScore(a, requirements);
    const secB = computeSecondaryScore(b, requirements);
    if (Math.abs(secA - secB) >= 10) return secB - secA;
    return (a.future_proof_score ?? 50) - (b.future_proof_score ?? 50);
  });

  const fullMatches = scored.filter((l) => computeUseCaseMatch(l, requirements) >= 85);
  let pool: ScoredLaptop[];
  if (fullMatches.length >= 3) {
    pool = [...fullMatches].sort(
      (a, b) => (a.future_proof_score ?? 50) - (b.future_proof_score ?? 50),
    );
  } else {
    const sliced = scored.slice(0, Math.max(6, Math.ceil(scored.length / 3)));
    sliced.sort(
      (a, b) => (a.future_proof_score ?? 50) - (b.future_proof_score ?? 50),
    );
    pool = sliced;
  }

  const n = pool.length;
  let minI = 0;
  let midI = 0;
  let maxI = 0;
  if (n === 1) {
    minI = midI = maxI = 0;
  } else if (n === 2) {
    minI = 0; midI = 0; maxI = 1;
  } else {
    minI = 0;
    maxI = n - 1;
    midI = Math.floor(n / 2);
    if (n === 3) {
      // already 3 distinct, just use 0, 1, 2
    } else {
      // Ensure distinct indices
      if (midI === minI) midI = Math.min(n - 1, midI + 1);
      if (midI === maxI) midI = Math.max(0, midI - 1);
      const set = new Set([minI, midI, maxI]);
      if (set.size < 3) {
        for (let i = 0; i < n && set.size < 3; i++) if (!set.has(i)) set.add(i);
      }
      const [a, b, c] = [...set].sort((x, y) => x - y);
      minI = a; midI = b; maxI = c;
    }
  }

  const stripScore = (l: ScoredLaptop | null): Laptop | null => {
    if (!l) return null;
    const copy: Partial<ScoredLaptop> = { ...l };
    delete copy.score;
    return copy as Laptop;
  };

  return {
    minimum: stripScore(pool[minI] ?? null),
    balanced: stripScore(pool[midI] ?? null),
    future_proof: stripScore(pool[maxI] ?? null),
  };
}

export async function loadLaptopsFromJSON(): Promise<Laptop[]> {
  try {
    const module = await import("@/data/laptops.json", { assert: { type: "json" } });
    const data = (module.default ?? module) as unknown;
    if (Array.isArray(data)) return data as Laptop[];
    return [];
  } catch {
    try {
      const raw = require("@/data/laptops.json");
      if (Array.isArray(raw)) return raw as Laptop[];
      return [];
    } catch {
      return [];
    }
  }
}

export async function getLocalRecommendations(
  requirements: Requirements,
): Promise<RecommendationResult> {
  const laptops = await loadLaptopsFromJSON();
  return getRecommendations(laptops, requirements);
}
