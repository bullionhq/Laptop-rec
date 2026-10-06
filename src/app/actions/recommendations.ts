"use server";

import type { Laptop, Requirements, RecommendationResult, RecommendationTier, ScoredLaptop } from "@/lib/types";
import { getRecommendations, loadLaptopsFromJSON } from "@/lib/scoring/engine";
import { createClient, createAdminClient } from "@/lib/supabase/server";

function hasEnvConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_SECRET_KEY),
  );
}

async function loadLaptopsFromSupabase(): Promise<Laptop[] | null> {
  if (!hasEnvConfig()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("laptops").select("*");
    if (error) {
      console.warn("[recommendations] Supabase laptops query failed:", error.message);
      return null;
    }
    if (!Array.isArray(data)) return null;
    return data as Laptop[];
  } catch (err) {
    console.warn("[recommendations] Error fetching laptops from Supabase:", err);
    return null;
  }
}

type TierRecord = { tier: RecommendationTier; laptop: Laptop | null };

function tierEntries(result: RecommendationResult): TierRecord[] {
  return [
    { tier: "minimum", laptop: result.minimum },
    { tier: "balanced", laptop: result.balanced },
    { tier: "future_proof", laptop: result.future_proof },
  ];
}

async function trySaveSession(
  requirements: Requirements,
  recommendations: RecommendationResult,
  scoredMap: Map<string, number>,
): Promise<void> {
  if (!hasEnvConfig()) return;
  try {
    const supabase = await createClient();
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .insert({ requirements: requirements as unknown as object })
      .select("id")
      .single();

    if (sessionError || !sessionData?.id) {
      console.warn("[recommendations] Session save skipped:", sessionError?.message);
      return;
    }

    const rows = tierEntries(recommendations)
      .filter(({ laptop }) => laptop !== null)
      .map(({ tier, laptop }) => ({
        session_id: sessionData.id,
        tier,
        laptop_id: laptop!.id,
        score: scoredMap.get(laptop!.id) ?? null,
        explanation: null,
      }));

    if (rows.length > 0) {
      const { error: recError } = await supabase.from("recommendations").insert(rows);
      if (recError) {
        console.warn("[recommendations] Recommendations save skipped:", recError.message);
      }
    }
  } catch (err) {
    console.warn("[recommendations] Save to Supabase failed silently:", err);
  }
}

export async function getRecommendationsAction(
  requirements: Requirements,
): Promise<RecommendationResult> {
  let laptops = await loadLaptopsFromSupabase();
  if (!laptops || laptops.length === 0) {
    laptops = await loadLaptopsFromJSON();
  }

  const scoredAll: ScoredLaptop[] = (laptops ?? []).map((l) => ({
    ...l,
    score:
      (l.use_cases ?? []).filter((uc) => requirements.use_cases.includes(uc)).length /
      Math.max(1, requirements.use_cases.length),
  }));
  const scoreByLaptopId = new Map<string, number>();
  for (const s of scoredAll) scoreByLaptopId.set(s.id, s.score);

  const result = getRecommendations(laptops ?? [], requirements);

  await trySaveSession(requirements, result, scoreByLaptopId);

  return result;
}
