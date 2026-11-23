// src/services/monetizationService.ts
/**
 * Kinetic Sovereign Monetization, Checkout & Recovery Service
 *
 * Implements:
 * - 1 Focus + 2 Routines Invariant
 * - StoreKit 2 / Stripe 16-Day Grace Period Handling
 * - Purchasing Power Parity (PPP) localization
 * - Tolerant Card Input & Scheme Detection (Postel's Law)
 * - Offline Vault Synchronization & Reconnection Polling
 * - Cryo-Buffer 30-Day Freeze ($0.00) & Telemetry JSON Export
 */

export type SubscriptionTier =
  | "annual_covenant"
  | "monthly_operator"
  | "quarterly_operator"
  | "lifetime_sovereign"
  | "unmonitored_free";

export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "in_grace_period"
  | "paused_cryo"
  | "cancelled"
  | "unmonitored_free";

export interface PlanPricing {
  tier: SubscriptionTier;
  id: string;
  name: string;
  cadenceLabel: string;
  displayPrice: string;
  rawPrice: number;
  perDayPrice: string;
  perWeekPrice: string;
  savingsBadge?: string;
  billedNote: string;
}

export interface PricingTierData {
  tierNumber: 1 | 2 | 3;
  currencySymbol: string;
  currencyCode: string;
  annual: PlanPricing;
  monthly: PlanPricing;
  quarterly: PlanPricing;
  lifetime: PlanPricing;
}

export interface SubscriptionState {
  status: SubscriptionStatus;
  tier: SubscriptionTier;
  planId: string;
  trialStartDate: string | null;
  trialEndDate: string | null;
  nextBillingDate: string | null;
  gracePeriodEndDate: string | null;
  cryoResumeDate: string | null;
  paymentMethodSummary: string | null;
  lastPaymentError: string | null;
  isOfflineCached: boolean;
  cancellationReason?: string;
}

const STORAGE_KEY = "kinetic_subscription_state";
const VAULT_CACHE_KEY = "kinetic_vault_auth_token";

// Purchasing Power Parity (PPP) Matrix
export function getPricingByCountry(countryCode?: string): PricingTierData {
  const code = (countryCode || "").toUpperCase();

  // Tier 3: Emerging economies
  const tier3Countries = ["IN", "ID", "VN", "PH", "PK", "BD", "NG", "KE", "EG", "GH"];
  // Tier 2: Mid economies
  const tier2Countries = ["BR", "MX", "PL", "TR", "AR", "CO", "ZA", "TH", "MY", "CL", "RO"];

  if (tier3Countries.includes(code)) {
    return {
      tierNumber: 3,
      currencySymbol: "$",
      currencyCode: "USD",
      annual: {
        tier: "annual_covenant",
        id: "kinetic_annual_tier3",
        name: "Annual Covenant",
        cadenceLabel: "year",
        displayPrice: "$29.99",
        rawPrice: 29.99,
        perDayPrice: "$0.08",
        perWeekPrice: "$0.57",
        savingsBadge: "Save 50%",
        billedNote: "Billed annually at $29.99/yr after 7-day trial",
      },
      monthly: {
        tier: "monthly_operator",
        id: "kinetic_monthly_tier3",
        name: "Monthly Operator",
        cadenceLabel: "month",
        displayPrice: "$4.99",
        rawPrice: 4.99,
        perDayPrice: "$0.16",
        perWeekPrice: "$1.15",
        billedNote: "Billed monthly at $4.99/mo after 7-day trial",
      },
      quarterly: {
        tier: "quarterly_operator",
        id: "kinetic_quarterly_tier3",
        name: "Quarterly Pulse",
        cadenceLabel: "quarter",
        displayPrice: "$12.99",
        rawPrice: 12.99,
        perDayPrice: "$0.14",
        perWeekPrice: "$1.00",
        billedNote: "Billed quarterly at $12.99 every 90 days",
      },
      lifetime: {
        tier: "lifetime_sovereign",
        id: "kinetic_lifetime_tier3",
        name: "Lifetime Sovereign",
        cadenceLabel: "one-time",
        displayPrice: "$99.00",
        rawPrice: 99.00,
        perDayPrice: "Zero",
        perWeekPrice: "Zero",
        savingsBadge: "Permanent Access",
        billedNote: "Single investment. Perpetual access.",
      },
    };
  }

  if (tier2Countries.includes(code)) {
    return {
      tierNumber: 2,
      currencySymbol: "$",
      currencyCode: "USD",
      annual: {
        tier: "annual_covenant",
        id: "kinetic_annual_tier2",
        name: "Annual Covenant",
        cadenceLabel: "year",
        displayPrice: "$59.99",
        rawPrice: 59.99,
        perDayPrice: "$0.16",
        perWeekPrice: "$1.15",
        savingsBadge: "Save 44%",
        billedNote: "Billed annually at $59.99/yr after 7-day trial",
      },
      monthly: {
        tier: "monthly_operator",
        id: "kinetic_monthly_tier2",
        name: "Monthly Operator",
        cadenceLabel: "month",
        displayPrice: "$8.99",
        rawPrice: 8.99,
        perDayPrice: "$0.30",
        perWeekPrice: "$2.07",
        billedNote: "Billed monthly at $8.99/mo after 7-day trial",
      },
      quarterly: {
        tier: "quarterly_operator",
        id: "kinetic_quarterly_tier2",
        name: "Quarterly Pulse",
        cadenceLabel: "quarter",
        displayPrice: "$22.99",
        rawPrice: 22.99,
        perDayPrice: "$0.25",
        perWeekPrice: "$1.77",
        billedNote: "Billed quarterly at $22.99 every 90 days",
      },
      lifetime: {
        tier: "lifetime_sovereign",
        id: "kinetic_lifetime_tier2",
        name: "Lifetime Sovereign",
        cadenceLabel: "one-time",
        displayPrice: "$189.00",
        rawPrice: 189.00,
        perDayPrice: "Zero",
        perWeekPrice: "Zero",
        savingsBadge: "Permanent Access",
        billedNote: "Single investment. Perpetual access.",
      },
    };
  }

  // Tier 1: Standard Global Default (US, GB, DE, FR, JP, CA, AU, etc.)
  return {
    tierNumber: 1,
    currencySymbol: "$",
    currencyCode: "USD",
    annual: {
      tier: "annual_covenant",
      id: "kinetic_annual_tier1",
      name: "Annual Covenant",
      cadenceLabel: "year",
      displayPrice: "$79.99",
      rawPrice: 79.99,
      perDayPrice: "$0.22",
      perWeekPrice: "$1.53",
      savingsBadge: "Save 44%",
      billedNote: "Billed annually at $79.99/yr after 7-day trial",
    },
    monthly: {
      tier: "monthly_operator",
      id: "kinetic_monthly_tier1",
      name: "Monthly Operator",
      cadenceLabel: "month",
      displayPrice: "$11.99",
      rawPrice: 11.99,
      perDayPrice: "$0.40",
      perWeekPrice: "$2.76",
      billedNote: "Billed monthly at $11.99/mo after 7-day trial",
    },
    quarterly: {
      tier: "quarterly_operator",
      id: "kinetic_quarterly_tier1",
      name: "Quarterly Pulse",
      cadenceLabel: "quarter",
      displayPrice: "$29.99",
      rawPrice: 29.99,
      perDayPrice: "$0.33",
      perWeekPrice: "$2.30",
      billedNote: "Billed quarterly at $29.99 every 90 days",
    },
    lifetime: {
      tier: "lifetime_sovereign",
      id: "kinetic_lifetime_tier1",
      name: "Lifetime Sovereign",
      cadenceLabel: "one-time",
      displayPrice: "$249.00",
      rawPrice: 249.00,
      perDayPrice: "Zero",
      perWeekPrice: "Zero",
      savingsBadge: "Permanent Access",
      billedNote: "Single investment. Perpetual access.",
    },
  };
}

// Tolerant Card Input & Card Scheme Detection (Postel's Law)
export type CardScheme = "visa" | "mastercard" | "amex" | "generic";

export function detectCardScheme(numberStr: string): CardScheme {
  const clean = numberStr.replace(/\D/g, "");
  if (/^4/.test(clean)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "mastercard";
  if (/^3[47]/.test(clean)) return "amex";
  return "generic";
}

export function formatCardNumber(val: string): string {
  const clean = val.replace(/\D/g, "");
  const scheme = detectCardScheme(clean);

  if (scheme === "amex") {
    // 4 - 6 - 5 format for Amex
    const p1 = clean.slice(0, 4);
    const p2 = clean.slice(4, 10);
    const p3 = clean.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }

  // Standard 4 - 4 - 4 - 4 format
  const parts: string[] = [];
  for (let i = 0; i < clean.length && i < 16; i += 4) {
    parts.push(clean.slice(i, i + 4));
  }
  return parts.join(" ");
}

export function formatExpiry(val: string): string {
  const clean = val.replace(/\D/g, "").slice(0, 4);
  if (clean.length >= 2) {
    const month = parseInt(clean.slice(0, 2), 10);
    const validMonth = Math.min(12, Math.max(1, month)).toString().padStart(2, "0");
    const year = clean.slice(2);
    return year ? `${validMonth}/${year}` : validMonth;
  }
  return clean;
}

export function formatCvc(val: string, scheme: CardScheme = "generic"): string {
  const max = scheme === "amex" ? 4 : 3;
  return val.replace(/\D/g, "").slice(0, max);
}

// Subscription State Accessors
export function getSubscriptionState(): SubscriptionState {
  if (typeof window === "undefined") {
    return getInitialSubscriptionState();
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        return parsed as SubscriptionState;
      }
    }
  } catch {
    // Fallback
  }
  return getInitialSubscriptionState();
}

export function saveSubscriptionState(state: SubscriptionState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to save subscription state:", err);
  }
}

export function getInitialSubscriptionState(): SubscriptionState {
  return {
    status: "none",
    tier: "unmonitored_free",
    planId: "free",
    trialStartDate: null,
    trialEndDate: null,
    nextBillingDate: null,
    gracePeriodEndDate: null,
    cryoResumeDate: null,
    paymentMethodSummary: null,
    lastPaymentError: null,
    isOfflineCached: false,
  };
}

/**
 * Checks whether user has active uninterrupted trajectory access.
 * Granted if:
 * 1. Status is "trialing"
 * 2. Status is "active"
 * 3. Status is "in_grace_period" (StoreKit 2 / Stripe 16-day grace period guarantee)
 * 4. Status is "unmonitored_free" (limited free tier)
 */
export function hasActiveAccess(state: SubscriptionState): boolean {
  if (state.status === "trialing" || state.status === "active") return true;
  if (state.status === "in_grace_period") {
    if (!state.gracePeriodEndDate) return true;
    return new Date(state.gracePeriodEndDate).getTime() > Date.now();
  }
  if (state.status === "unmonitored_free") return true;
  return false;
}

/**
 * Initiates 7-Day Trajectory Trial with Stripe SetupIntent or Native StoreKit 2
 */
export function startTrialSubscription(
  plan: PlanPricing,
  paymentSummary: string = "Apple Pay"
): SubscriptionState {
  const now = new Date();
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
  const billingDate = new Date(trialEnd);

  const newState: SubscriptionState = {
    status: "trialing",
    tier: plan.tier,
    planId: plan.id,
    trialStartDate: now.toISOString(),
    trialEndDate: trialEnd.toISOString(),
    nextBillingDate: billingDate.toISOString(),
    gracePeriodEndDate: null,
    cryoResumeDate: null,
    paymentMethodSummary: paymentSummary,
    lastPaymentError: null,
    isOfflineCached: false,
  };

  saveSubscriptionState(newState);
  return newState;
}

/**
 * Simulates a payment failure and triggers the 16-Day Grace Period
 */
export function triggerGracePeriod(errorReason: string = "Card declined: insufficient funds"): SubscriptionState {
  const current = getSubscriptionState();
  const now = new Date();
  const graceEnd = new Date(now.getTime() + 16 * 24 * 60 * 60 * 1000); // 16-day StoreKit 2 / Stripe window

  const newState: SubscriptionState = {
    ...current,
    status: "in_grace_period",
    lastPaymentError: errorReason,
    gracePeriodEndDate: graceEnd.toISOString(),
  };

  saveSubscriptionState(newState);
  return newState;
}

/**
 * Resolves a grace period issue with a refreshed payment method
 */
export function resolvePaymentIssue(newPaymentSummary: string): SubscriptionState {
  const current = getSubscriptionState();
  const now = new Date();
  const nextBilling = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const newState: SubscriptionState = {
    ...current,
    status: "active",
    paymentMethodSummary: newPaymentSummary,
    lastPaymentError: null,
    gracePeriodEndDate: null,
    nextBillingDate: nextBilling.toISOString(),
  };

  saveSubscriptionState(newState);
  return newState;
}

/**
 * Freezes trajectory for up to 30 days under Cryo-Buffer ($0.00 rescue offer)
 */
export function applyCryoBufferFreeze(days: number = 30): SubscriptionState {
  const current = getSubscriptionState();
  const resumeDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const newState: SubscriptionState = {
    ...current,
    status: "paused_cryo",
    cryoResumeDate: resumeDate.toISOString(),
  };

  saveSubscriptionState(newState);
  return newState;
}

/**
 * Confirms dignified cancellation
 */
export function cancelSubscription(reason: string): SubscriptionState {
  const current = getSubscriptionState();
  const newState: SubscriptionState = {
    ...current,
    status: "cancelled",
    cancellationReason: reason,
  };

  saveSubscriptionState(newState);
  return newState;
}

/**
 * Opt-in for Unmonitored Free Tier
 */
export function optIntoFreeTier(): SubscriptionState {
  const newState: SubscriptionState = {
    status: "unmonitored_free",
    tier: "unmonitored_free",
    planId: "free",
    trialStartDate: null,
    trialEndDate: null,
    nextBillingDate: null,
    gracePeriodEndDate: null,
    cryoResumeDate: null,
    paymentMethodSummary: null,
    lastPaymentError: null,
    isOfflineCached: false,
  };

  saveSubscriptionState(newState);
  return newState;
}

// Offline Optimistic Vault Cache & Sync
export function cacheOfflineAuthorization(plan: PlanPricing, method: string): void {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      token: `vault_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      planId: plan.id,
      tier: plan.tier,
      method,
    };
    localStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Offline vault caching failed:", err);
  }
}

export function getOfflineCachedToken(): { token: string; timestamp: number; planId: string; tier: SubscriptionTier; method: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VAULT_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return null;
}

export function clearOfflineCachedToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(VAULT_CACHE_KEY);
  } catch {
    // Ignore
  }
}

// Telemetry Export for Dignified Cancellation
export function exportTrajectoryTelemetryJSON(onboardingState: any, subState: SubscriptionState): string {
  const exportData = {
    schema: "kinetic_trajectory_telemetry_v1",
    exportedAt: new Date().toISOString(),
    brand: "Kinetic (The Improvement System)",
    invariants: {
      focusConstraint: "1 Primary Focus + up to 2 Supporting Routines",
      bufferEnvelope: "±10% mathematical buffer cone (9 flex days per 90-day horizon)",
      gamificationStatus: "zero streaks / zero RPG tropes / deterministic telemetry",
    },
    trajectory: {
      primaryObjective: onboardingState?.primaryGoal || "Production launch",
      goalCategory: onboardingState?.goalCategory || "engineering",
      supportingRoutines: (onboardingState?.supportingRoutines || []).slice(0, 2),
      operatingRegion: onboardingState?.country || "Global",
      timezone: onboardingState?.timezone || "UTC",
      executionAnchor: onboardingState?.contextualTrigger || "Morning standup",
      timeWindow: onboardingState?.timeWindow || "dawn",
      horizonDays: onboardingState?.horizonDays || 90,
      bufferCapacityDays: onboardingState?.bufferDays || 9,
    },
    subscriptionAudit: {
      status: subState.status,
      tier: subState.tier,
      trialStarted: subState.trialStartDate,
      nextBillingDate: subState.nextBillingDate,
      cancellationReason: subState.cancellationReason || "User requested export",
    },
  };

  return JSON.stringify(exportData, null, 2);
}
