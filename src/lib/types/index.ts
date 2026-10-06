export type Laptop = {
  id: string;
  name: string;
  brand: string;
  price: number;
  cpu: string | null;
  gpu: string | null;
  ram_gb: number | null;
  storage_gb: number | null;
  screen_size: number | null;
  screen_type: string | null;
  weight_kg: number | null;
  battery_hours: number | null;
  os: string | null;
  use_cases: string[] | null;
  performance_score: number | null;
  portability_score: number | null;
  value_score: number | null;
  future_proof_score: number | null;
  gpu_tier: number | null;
  image_url: string | null;
  buy_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Requirements = {
  use_cases: string[];
  budget_min: number;
  budget_max: number;
  screen_pref: string;
  portability: string;
  os_pref: string;
  performance: string;
};

export type RecommendationTier = "minimum" | "balanced" | "future_proof";

export type ScoredLaptop = Laptop & {
  score: number;
};

export type RecommendationResult = {
  minimum: Laptop | null;
  balanced: Laptop | null;
  future_proof: Laptop | null;
};

export type Session = {
  id: string;
  requirements: Requirements;
  created_at: string;
};
