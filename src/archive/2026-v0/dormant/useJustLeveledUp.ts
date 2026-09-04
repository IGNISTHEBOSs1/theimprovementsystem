import { useEffect, useRef, useState } from "react";

/**
 * Detects a level increase and exposes a short-lived `justLeveledUp` flag.
 * Lives outside SystemBar deliberately: "components render meaning, they do
 * not derive meaning." This is identity-transition logic, not Bar behavior.
 * TEMPORARY home — belongs in the identity layer proper once one exists
 * (e.g. alongside useGameState / a future identity context).
 */
export function useJustLeveledUp(level: number): boolean {
  const prevLevel = useRef(level);
  const [justLeveledUp, setJustLeveledUp] = useState(false);

  useEffect(() => {
    if (level > prevLevel.current) {
      setJustLeveledUp(true);
      const timeout = setTimeout(() => setJustLeveledUp(false), 900);
      prevLevel.current = level;
      return () => clearTimeout(timeout);
    }
    prevLevel.current = level;
  }, [level]);

  return justLeveledUp;
}
