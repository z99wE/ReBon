export type RoadmapAction = {
  action: string;
  carbonSavingKg: number;
  difficulty: string;
};

export type RoadmapPhase = {
  phase: number;
  title: string;
  actions: RoadmapAction[];
};

export type Roadmap = {
  phases: RoadmapPhase[];
};

export type ParsedActivity = {
  category: "transport" | "meals" | "energy" | "shopping" | "other";
  subcategory: string;
  label: string;
  carbonKg: number;
  quantity?: number;
  unit?: string;
};

export type ChallengeDraft = {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  carbonSavingKg?: number;
  pointsReward?: number;
  trendingTopic?: string;
};

export type StoryDraft = {
  headline?: string;
  narrative?: string;
};

export type MirrorInsights = {
  insights?: string[];
};
