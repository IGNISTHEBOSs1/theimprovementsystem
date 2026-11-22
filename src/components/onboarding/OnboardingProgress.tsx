// src/components/onboarding/OnboardingProgress.tsx
import React from "react";
import { motion } from "framer-motion";

interface OnboardingProgressProps {
  currentStep: number; // 1 to 7
  totalSteps?: number; // 7
}

export function OnboardingProgress({ currentStep, totalSteps = 7 }: OnboardingProgressProps) {
  return (
    <div
      className="w-full select-none py-1.5"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Onboarding progress step ${currentStep} of ${totalSteps}`}
    >
      <div className="flex gap-2 h-2 w-full">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className="relative flex-1 h-full rounded-full bg-muted/70 border border-border/70 overflow-hidden"
            >
              {isCompleted && (
                <div className="h-full w-full bg-emerald-500 rounded-full shadow-xs" />
              )}
              {isCurrent && (
                <motion.div
                  className="h-full bg-emerald-500 rounded-full shadow-xs"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
