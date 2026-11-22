// src/components/onboarding/types.ts

export interface OnboardingState {
  // Stage 1: Diagnostic
  failureReason: string | null;

  // Stage 2: Geographic Anchor
  country: string;
  countryCode: string;
  timezone: string;
  utcOffset: string;
  coordinates: [number, number]; // [lat, lng]

  // Stage 3: North Star
  primaryGoal: string;
  goalCategory: "athletic" | "engineering" | "intellectual" | "financial" | "custom";

  // Stage 4: Scaffolding (Strictly 2)
  supportingRoutines: string[];

  // Stage 5: Execution Anchor
  timeWindow: "dawn" | "midday" | "evening";
  contextualTrigger: string;

  // Calibration telemetry
  horizonDays: number; // default 90
  bufferDays: number;  // default 9 (10%)
}
