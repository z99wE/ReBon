import type { Challenge, FeedItem, LeaderboardEntry, LeaderboardSeason, Story } from "./types";

export type StoryEquivalents = {
  trees: number;
  km_not_driven: number;
  flights_avoided: number;
  phone_charges: number;
  meals_saved: number;
  lightbulb_hours: number;
};

export type RoadmapAction = {
  action: string;
  carbonSavingKg: number;
};

export type RoadmapPhase = {
  phase: number;
  title: string;
  actions: RoadmapAction[];
};

export type OnboardingResult = {
  archetype: { id: string; label: string };
  roadmap: { phases: RoadmapPhase[] };
};

export type ActiveChallenge = Pick<
  Challenge,
  "id" | "title" | "description" | "category" | "difficulty" | "carbonSavingKg" | "pointsReward" | "completedAt" | "status"
>;

export type LeaderboardRow = LeaderboardEntry & {
  user?: {
    id: string;
    name: string | null;
    archetype: string | null;
    archetypeLabel: string | null;
  };
};

export type LeaderboardResponse = {
  season: LeaderboardSeason | null;
  entries: LeaderboardRow[];
};

export type FeedItemRow = FeedItem & {
  user?: {
    id: string;
    name: string | null;
    archetype: string | null;
    influenceScore: number;
  };
};

export type StoryRow = Omit<Story, "equivalents"> & {
  equivalents: StoryEquivalents;
};
