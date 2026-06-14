/**
 * ReBon Shared Carbon Data
 * Emission factors, archetypes, and activity presets used across frontend and backend.
 */

// ─── Lifestyle Archetypes ─────────────────────────────────────────────────────
export const ARCHETYPES = {
  urban_commuter: {
    id: "urban_commuter",
    label: "Urban Commuter",
    description: "City dweller who relies on public transit and drives occasionally",
    icon: "🚇",
    color: "oklch(0.60 0.15 200)",
    weeklyAvgKg: 55,
    topCategories: ["transport", "energy"],
  },
  conscious_consumer: {
    id: "conscious_consumer",
    label: "Conscious Consumer",
    description: "Mindful shopper who prioritizes sustainable products and plant-based diet",
    icon: "🌿",
    color: "oklch(0.55 0.14 145)",
    weeklyAvgKg: 40,
    topCategories: ["shopping", "meals"],
  },
  energy_heavy: {
    id: "energy_heavy",
    label: "Energy Heavy",
    description: "High energy user — large home, frequent flights, energy-intensive lifestyle",
    icon: "⚡",
    color: "oklch(0.65 0.18 35)",
    weeklyAvgKg: 120,
    topCategories: ["energy", "transport"],
  },
  eco_pioneer: {
    id: "eco_pioneer",
    label: "Eco Pioneer",
    description: "Leading the way — solar panels, EV, vegan diet, zero-waste lifestyle",
    icon: "🌱",
    color: "oklch(0.50 0.12 145)",
    weeklyAvgKg: 20,
    topCategories: ["meals", "shopping"],
  },
  suburban_family: {
    id: "suburban_family",
    label: "Suburban Family",
    description: "Family of 4 in suburbs — two cars, mixed diet, average home energy use",
    icon: "🏡",
    color: "oklch(0.55 0.14 85)",
    weeklyAvgKg: 85,
    topCategories: ["transport", "meals", "energy"],
  },
  digital_nomad: {
    id: "digital_nomad",
    label: "Digital Nomad",
    description: "Remote worker who travels frequently, lives light, but flies often",
    icon: "✈️",
    color: "oklch(0.60 0.16 280)",
    weeklyAvgKg: 70,
    topCategories: ["transport", "meals"],
  },
} as const;

export type ArchetypeId = keyof typeof ARCHETYPES;

// ─── Carbon Emission Factors (kg CO2e per unit) ───────────────────────────────
export const EMISSION_FACTORS = {
  transport: {
    car_petrol_km: 0.192,        // per km
    car_diesel_km: 0.171,
    car_electric_km: 0.053,
    bus_km: 0.089,
    train_km: 0.041,
    metro_km: 0.028,
    flight_domestic_km: 0.255,
    flight_short_km: 0.195,
    flight_long_km: 0.147,
    motorcycle_km: 0.114,
    bicycle_km: 0.0,
    walking_km: 0.0,
    taxi_km: 0.211,
    rideshare_km: 0.158,
  },
  meals: {
    beef_meal: 3.5,              // per meal
    lamb_meal: 2.4,
    pork_meal: 1.2,
    chicken_meal: 0.9,
    fish_meal: 0.7,
    vegetarian_meal: 0.4,
    vegan_meal: 0.25,
    dairy_meal: 0.6,
    coffee_cup: 0.21,
    tea_cup: 0.03,
    beer_pint: 0.34,
    wine_glass: 0.18,
    fast_food_meal: 2.1,
    restaurant_meal: 1.5,
  },
  energy: {
    electricity_kwh: 0.233,      // per kWh (global avg)
    natural_gas_kwh: 0.203,
    heating_oil_liter: 2.52,
    coal_kg: 2.42,
    solar_kwh: 0.041,
    wind_kwh: 0.011,
    shower_minute: 0.08,
    bath: 0.52,
    washing_machine_cycle: 0.6,
    dishwasher_cycle: 0.7,
    dryer_cycle: 1.8,
    laptop_hour: 0.013,
    desktop_hour: 0.055,
    tv_hour: 0.035,
    ac_hour: 0.8,
  },
  shopping: {
    clothing_item: 10.0,         // per item (avg)
    electronics_small: 15.0,
    electronics_large: 80.0,
    furniture_item: 45.0,
    book: 1.0,
    plastic_bag: 0.033,
    online_order: 0.5,
    grocery_weekly: 8.5,
    beauty_product: 2.0,
  },
} as const;

// ─── Activity Presets (Quick-Tap) ─────────────────────────────────────────────
export const ACTIVITY_PRESETS = {
  transport: [
    { id: "car_petrol_10km", label: "Car 10km", subcategory: "car_petrol_km", quantity: 10, unit: "km", carbonKg: 1.92, icon: "🚗" },
    { id: "car_petrol_30km", label: "Car 30km", subcategory: "car_petrol_km", quantity: 30, unit: "km", carbonKg: 5.76, icon: "🚗" },
    { id: "bus_10km", label: "Bus 10km", subcategory: "bus_km", quantity: 10, unit: "km", carbonKg: 0.89, icon: "🚌" },
    { id: "train_50km", label: "Train 50km", subcategory: "train_km", quantity: 50, unit: "km", carbonKg: 2.05, icon: "🚆" },
    { id: "metro_5km", label: "Metro 5km", subcategory: "metro_km", quantity: 5, unit: "km", carbonKg: 0.14, icon: "🚇" },
    { id: "flight_domestic", label: "Domestic Flight", subcategory: "flight_domestic_km", quantity: 500, unit: "km", carbonKg: 127.5, icon: "✈️" },
    { id: "bicycle", label: "Bicycle", subcategory: "bicycle_km", quantity: 10, unit: "km", carbonKg: 0, icon: "🚲" },
    { id: "walking", label: "Walking", subcategory: "walking_km", quantity: 3, unit: "km", carbonKg: 0, icon: "🚶" },
    { id: "ev_30km", label: "EV 30km", subcategory: "car_electric_km", quantity: 30, unit: "km", carbonKg: 1.59, icon: "⚡" },
    { id: "rideshare_10km", label: "Rideshare 10km", subcategory: "rideshare_km", quantity: 10, unit: "km", carbonKg: 1.58, icon: "🚕" },
  ],
  meals: [
    { id: "beef_meal", label: "Beef Meal", subcategory: "beef_meal", quantity: 1, unit: "meal", carbonKg: 3.5, icon: "🥩" },
    { id: "chicken_meal", label: "Chicken Meal", subcategory: "chicken_meal", quantity: 1, unit: "meal", carbonKg: 0.9, icon: "🍗" },
    { id: "fish_meal", label: "Fish Meal", subcategory: "fish_meal", quantity: 1, unit: "meal", carbonKg: 0.7, icon: "🐟" },
    { id: "vegetarian_meal", label: "Vegetarian Meal", subcategory: "vegetarian_meal", quantity: 1, unit: "meal", carbonKg: 0.4, icon: "🥗" },
    { id: "vegan_meal", label: "Vegan Meal", subcategory: "vegan_meal", quantity: 1, unit: "meal", carbonKg: 0.25, icon: "🌱" },
    { id: "fast_food", label: "Fast Food", subcategory: "fast_food_meal", quantity: 1, unit: "meal", carbonKg: 2.1, icon: "🍔" },
    { id: "coffee", label: "Coffee", subcategory: "coffee_cup", quantity: 1, unit: "cup", carbonKg: 0.21, icon: "☕" },
    { id: "pork_meal", label: "Pork Meal", subcategory: "pork_meal", quantity: 1, unit: "meal", carbonKg: 1.2, icon: "🥓" },
  ],
  energy: [
    { id: "electricity_5kwh", label: "5 kWh Electricity", subcategory: "electricity_kwh", quantity: 5, unit: "kWh", carbonKg: 1.165, icon: "💡" },
    { id: "electricity_10kwh", label: "10 kWh Electricity", subcategory: "electricity_kwh", quantity: 10, unit: "kWh", carbonKg: 2.33, icon: "💡" },
    { id: "shower_10min", label: "10min Shower", subcategory: "shower_minute", quantity: 10, unit: "min", carbonKg: 0.8, icon: "🚿" },
    { id: "ac_4hr", label: "AC 4 hours", subcategory: "ac_hour", quantity: 4, unit: "hr", carbonKg: 3.2, icon: "❄️" },
    { id: "washing_machine", label: "Washing Machine", subcategory: "washing_machine_cycle", quantity: 1, unit: "cycle", carbonKg: 0.6, icon: "🫧" },
    { id: "dryer", label: "Tumble Dryer", subcategory: "dryer_cycle", quantity: 1, unit: "cycle", carbonKg: 1.8, icon: "🌀" },
    { id: "laptop_8hr", label: "Laptop 8hr", subcategory: "laptop_hour", quantity: 8, unit: "hr", carbonKg: 0.104, icon: "💻" },
  ],
  shopping: [
    { id: "clothing_item", label: "Clothing Item", subcategory: "clothing_item", quantity: 1, unit: "item", carbonKg: 10.0, icon: "👕" },
    { id: "electronics_small", label: "Small Electronics", subcategory: "electronics_small", quantity: 1, unit: "item", carbonKg: 15.0, icon: "📱" },
    { id: "online_order", label: "Online Order", subcategory: "online_order", quantity: 1, unit: "order", carbonKg: 0.5, icon: "📦" },
    { id: "grocery_weekly", label: "Weekly Groceries", subcategory: "grocery_weekly", quantity: 1, unit: "shop", carbonKg: 8.5, icon: "🛒" },
    { id: "book", label: "Book", subcategory: "book", quantity: 1, unit: "item", carbonKg: 1.0, icon: "📚" },
  ],
} as const;

// ─── Equivalents for Storytelling ─────────────────────────────────────────────
export function calculateEquivalents(carbonKg: number) {
  return {
    trees: +(carbonKg / 21).toFixed(1),           // 1 tree absorbs ~21 kg CO2/year
    km_not_driven: +(carbonKg / 0.192).toFixed(0), // petrol car
    flights_avoided: +(carbonKg / 127.5).toFixed(2),
    phone_charges: +(carbonKg / 0.005).toFixed(0),
    meals_saved: +(carbonKg / 3.5).toFixed(1),    // vs beef meal
    lightbulb_hours: +(carbonKg / 0.01).toFixed(0),
  };
}

// ─── Elo Rating System ────────────────────────────────────────────────────────
export function calculateEloChange(
  winnerElo: number,
  loserElo: number,
  kFactor = 32
): { winnerChange: number; loserChange: number } {
  const expectedWin = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const winnerChange = Math.round(kFactor * (1 - expectedWin));
  const loserChange = Math.round(kFactor * (0 - (1 - expectedWin)));
  return { winnerChange, loserChange };
}

// ─── Influence Score Algorithm ────────────────────────────────────────────────
export function calculateInfluenceScore(params: {
  carbonSavedKg: number;
  activitiesLogged: number;
  challengesCompleted: number;
  streakDays: number;
  followersCount: number;
}): number {
  const { carbonSavedKg, activitiesLogged, challengesCompleted, streakDays, followersCount } = params;
  const carbonScore = Math.min(carbonSavedKg * 0.5, 500);
  const activityScore = Math.min(activitiesLogged * 2, 200);
  const challengeScore = challengesCompleted * 15;
  const streakScore = Math.min(streakDays * 3, 150);
  const networkScore = Math.min(followersCount * 5, 250);
  return Math.round(carbonScore + activityScore + challengeScore + streakScore + networkScore);
}

// ─── Onboarding Questions ─────────────────────────────────────────────────────
export const ONBOARDING_QUESTIONS = [
  {
    id: "transport_primary",
    question: "How do you primarily get around?",
    category: "transport",
    options: [
      { label: "Personal car (petrol/diesel)", value: "car_petrol", score: { energy_heavy: 3, urban_commuter: 1 } },
      { label: "Electric vehicle", value: "car_electric", score: { eco_pioneer: 3, suburban_family: 2 } },
      { label: "Public transit (bus/train/metro)", value: "public_transit", score: { urban_commuter: 3, digital_nomad: 2 } },
      { label: "Bicycle or walking", value: "active", score: { eco_pioneer: 3, conscious_consumer: 2 } },
      { label: "Mix of car + transit", value: "mixed", score: { suburban_family: 2, urban_commuter: 2 } },
    ],
  },
  {
    id: "diet_type",
    question: "How would you describe your diet?",
    category: "meals",
    options: [
      { label: "Meat at every meal", value: "heavy_meat", score: { energy_heavy: 3, suburban_family: 2 } },
      { label: "Meat a few times a week", value: "moderate_meat", score: { suburban_family: 2, urban_commuter: 2 } },
      { label: "Mostly plant-based with some meat", value: "flexitarian", score: { conscious_consumer: 3, digital_nomad: 2 } },
      { label: "Vegetarian", value: "vegetarian", score: { conscious_consumer: 3, eco_pioneer: 2 } },
      { label: "Vegan", value: "vegan", score: { eco_pioneer: 3, conscious_consumer: 2 } },
    ],
  },
  {
    id: "home_type",
    question: "What type of home do you live in?",
    category: "energy",
    options: [
      { label: "Large house (4+ bedrooms)", value: "large_house", score: { energy_heavy: 3, suburban_family: 3 } },
      { label: "Medium house (2-3 bedrooms)", value: "medium_house", score: { suburban_family: 3, urban_commuter: 1 } },
      { label: "Apartment or flat", value: "apartment", score: { urban_commuter: 3, digital_nomad: 2 } },
      { label: "Shared accommodation", value: "shared", score: { digital_nomad: 3, conscious_consumer: 2 } },
    ],
  },
  {
    id: "flight_frequency",
    question: "How often do you fly?",
    category: "transport",
    options: [
      { label: "Multiple times a month", value: "very_frequent", score: { digital_nomad: 3, energy_heavy: 3 } },
      { label: "A few times a year", value: "occasional", score: { energy_heavy: 2, suburban_family: 2 } },
      { label: "Once a year or less", value: "rare", score: { urban_commuter: 2, conscious_consumer: 2 } },
      { label: "Never", value: "never", score: { eco_pioneer: 3, conscious_consumer: 2 } },
    ],
  },
  {
    id: "shopping_habits",
    question: "How would you describe your shopping habits?",
    category: "shopping",
    options: [
      { label: "Buy new items frequently", value: "frequent_buyer", score: { energy_heavy: 2, suburban_family: 2 } },
      { label: "Buy when needed, mostly new", value: "moderate_buyer", score: { urban_commuter: 2, digital_nomad: 2 } },
      { label: "Prefer second-hand or sustainable brands", value: "conscious_buyer", score: { conscious_consumer: 3, eco_pioneer: 2 } },
      { label: "Minimalist — buy very little", value: "minimalist", score: { eco_pioneer: 3, digital_nomad: 2 } },
    ],
  },
] as const;
