// src/components/onboarding/OnboardingGlobe.tsx
import React, { useEffect, useRef } from "react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import globeData from "./globeData.json";

interface OnboardingGlobeProps {
  targetCoordinates: [number, number]; // [lat, lng]
  onCoordinatesChange?: (coords: [number, number]) => void;
  className?: string;
}

interface UnitPoint {
  x: number;
  y: number;
  z: number;
}

// Pre-convert lat/lng degrees to unit sphere coordinates [x, y, z]
function toUnitSphere(lat: number, lng: number): UnitPoint {
  const latR = (lat * Math.PI) / 180;
  // Rotate longitude so 0 (Prime Meridian) faces front at phi=0
  const lngR = ((lng + 180) * Math.PI) / 180 - Math.PI;
  return {
    x: Math.cos(latR) * Math.sin(lngR),
    y: -Math.sin(latR),
    z: Math.cos(latR) * Math.cos(lngR),
  };
}

// Precompute 3D unit coordinates for all land polygons and country borders
const LAND_PATHS: UnitPoint[][] = (globeData.land as [number, number][][]).map((poly) =>
  poly.map(([lat, lng]) => toUnitSphere(lat, lng))
);

const BORDER_PATHS: UnitPoint[][] = (globeData.borders as [number, number][][]).map((line) =>
  line.map(([lat, lng]) => toUnitSphere(lat, lng))
);

// Precompute graticules (parallels & meridians)
const GRATICULES: UnitPoint[][] = [];
// Parallels (-60, -30, 0, 30, 60)
for (const lat of [-60, -30, 0, 30, 60]) {
  const line: UnitPoint[] = [];
  for (let lng = -180; lng <= 180; lng += 10) {
    line.push(toUnitSphere(lat, lng));
  }
  GRATICULES.push(line);
}
// Meridians (every 30 degrees)
for (let lng = -180; lng < 180; lng += 30) {
  const line: UnitPoint[] = [];
  for (let lat = -80; lat <= 80; lat += 10) {
    line.push(toUnitSphere(lat, lng));
  }
  GRATICULES.push(line);
}

export function OnboardingGlobe({
  targetCoordinates,
  onCoordinatesChange,
  className = "",
}: OnboardingGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shouldReduceMotion = useSafeReducedMotion();
  const shouldReduceMotionRef = useRef(Boolean(shouldReduceMotion));

  useEffect(() => {
    shouldReduceMotionRef.current = Boolean(shouldReduceMotion);
  }, [shouldReduceMotion]);

  const requestRenderRef = useRef<() => void>(() => {});

  // Rotation angles (radians)
  const phiRef = useRef<number>(-0.4); // Azimuthal (horizontal)
  const thetaRef = useRef<number>(0.2); // Polar (vertical tilt)

  // Inertia and dragging
  const velocityPhiRef = useRef<number>(0.0015); // Ambient drift
  const velocityThetaRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Slerp navigation target
  const targetPhiRef = useRef<number>(0);
  const targetThetaRef = useRef<number>(0);
  const isSlerpingRef = useRef<boolean>(false);
  const isLocationLockedRef = useRef<boolean>(true);
  const pointerDownPosRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });

  // Calculate target phi/theta when targetCoordinates change
  useEffect(() => {
    const [lat, lng] = targetCoordinates;
    // Target phi brings selected longitude to the front center
    const targetLngRad = -((lng * Math.PI) / 180);
    const targetLatRad = (lat * Math.PI) / 180;

    // Normalize angle difference to avoid spinning the long way around
    let diff = (targetLngRad - phiRef.current) % (Math.PI * 2);
    if (diff > Math.PI) diff -= Math.PI * 2;
    if (diff < -Math.PI) diff += Math.PI * 2;

    targetPhiRef.current = phiRef.current + diff;
    targetThetaRef.current = Math.max(-0.45, Math.min(0.45, targetLatRad * 0.7));

    if (shouldReduceMotion) {
      phiRef.current = targetPhiRef.current;
      thetaRef.current = targetThetaRef.current;
      velocityPhiRef.current = 0;
      velocityThetaRef.current = 0;
      isSlerpingRef.current = false;
    } else {
      isSlerpingRef.current = true;
    }
    isLocationLockedRef.current = true;
    requestRenderRef.current();
  }, [targetCoordinates, shouldReduceMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let isRunning = false;
    const dpr = typeof window !== "undefined" ? Math.min(2, window.devicePixelRatio || 1) : 1;
    let width = 320;
    let height = 300;
    let radarPulse = 0;

    function render() {
      radarPulse = (radarPulse + 0.035) % 1;

      // Physics / Slerp updates
      if (isSlerpingRef.current) {
        phiRef.current += (targetPhiRef.current - phiRef.current) * 0.08;
        thetaRef.current += (targetThetaRef.current - thetaRef.current) * 0.08;
        if (
          Math.abs(targetPhiRef.current - phiRef.current) < 0.003 &&
          Math.abs(targetThetaRef.current - thetaRef.current) < 0.003
        ) {
          isSlerpingRef.current = false;
          velocityPhiRef.current = 0;
          velocityThetaRef.current = 0;
        }
      } else if (!isDraggingRef.current) {
        velocityPhiRef.current *= 0.92; // Decay friction
        velocityThetaRef.current *= 0.92;

        // If a specific location is locked/selected, hold steady on it without drifting away
        if (!isLocationLockedRef.current) {
          if (Math.abs(velocityPhiRef.current) < 0.0006) {
            velocityPhiRef.current = 0.0008; // very subtle ambient drift only when manually browsing
          }
          phiRef.current += velocityPhiRef.current;
          thetaRef.current += velocityThetaRef.current;
        } else {
          // Locked to selected location: bring residual movement smoothly to zero
          if (Math.abs(velocityPhiRef.current) > 0.0001) {
            phiRef.current += velocityPhiRef.current;
          }
          if (Math.abs(velocityThetaRef.current) > 0.0001) {
            thetaRef.current += velocityThetaRef.current;
          }
        }
      }

      // Constrain polar tilt to prevent upside-down flipping
      thetaRef.current = Math.max(-0.55, Math.min(0.55, thetaRef.current));

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.44;

      const isDark =
        typeof document !== "undefined" &&
        document.documentElement.classList.contains("dark");

      // Rotation matrix values
      const cosP = Math.cos(phiRef.current);
      const sinP = Math.sin(phiRef.current);
      const cosT = Math.cos(thetaRef.current);
      const sinT = Math.sin(thetaRef.current);

      const project = (pt: UnitPoint): { px: number; py: number; z: number } => {
        const x1 = pt.x * cosP - pt.z * sinP;
        const z1 = pt.z * cosP + pt.x * sinP;
        const y2 = pt.y * cosT - z1 * sinT;
        const z2 = z1 * cosT + pt.y * sinT;
        return {
          px: cx + x1 * radius,
          py: cy + y2 * radius,
          z: z2,
        };
      };

      // ── Layer 1: Atmospheric Outer Glow ──
      const atmosphere = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.12);
      if (isDark) {
        atmosphere.addColorStop(0, "rgba(16, 185, 129, 0.03)");
        atmosphere.addColorStop(0.85, "rgba(56, 189, 248, 0.08)");
        atmosphere.addColorStop(1, "rgba(0, 0, 0, 0)");
      } else {
        atmosphere.addColorStop(0, "rgba(15, 23, 42, 0.02)");
        atmosphere.addColorStop(0.85, "rgba(56, 189, 248, 0.06)");
        atmosphere.addColorStop(1, "rgba(0, 0, 0, 0)");
      }
      ctx.fillStyle = atmosphere;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.12, 0, Math.PI * 2);
      ctx.fill();

      // ── Layer 2: 3D Earth Oceanic Base Sphere ──
      const oceanGrad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      if (isDark) {
        oceanGrad.addColorStop(0, "#131b2e");
        oceanGrad.addColorStop(0.65, "#0b101c");
        oceanGrad.addColorStop(1, "#070a12");
      } else {
        oceanGrad.addColorStop(0, "#f8fafc");
        oceanGrad.addColorStop(0.65, "#e2e8f0");
        oceanGrad.addColorStop(1, "#cbd5e1");
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // Rim border stroke
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(15, 23, 42, 0.14)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Clip all drawing to the sphere circle disc
      ctx.clip();

      // ── Layer 3: Graticules (Latitude & Longitude grid lines) ──
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.05)";
      ctx.lineWidth = 0.75;
      for (const line of GRATICULES) {
        ctx.beginPath();
        let drawing = false;
        for (let i = 0; i < line.length; i++) {
          const p = project(line[i]);
          if (p.z > 0) {
            if (!drawing) {
              ctx.moveTo(p.px, p.py);
              drawing = true;
            } else {
              ctx.lineTo(p.px, p.py);
            }
          } else {
            drawing = false;
          }
        }
        ctx.stroke();
      }

      // ── Layer 4: Landmass Continents (Polygons + Outlines) ──
      // First pass: Landmass fills
      ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.07)" : "rgba(15, 23, 42, 0.06)";
      for (const poly of LAND_PATHS) {
        if (poly.length < 3) continue;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < poly.length; i++) {
          const p = project(poly[i]);
          if (p.z > -0.05) {
            if (!started) {
              ctx.moveTo(p.px, p.py);
              started = true;
            } else {
              ctx.lineTo(p.px, p.py);
            }
          }
        }
        if (started) {
          ctx.closePath();
          ctx.fill();
        }
      }

      // Second pass: Crisp Coastlines
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.45)" : "rgba(15, 23, 42, 0.45)";
      ctx.lineWidth = 1.0;
      for (const poly of LAND_PATHS) {
        ctx.beginPath();
        let drawing = false;
        for (let i = 0; i < poly.length; i++) {
          const p = project(poly[i]);
          if (p.z > 0) {
            if (!drawing) {
              ctx.moveTo(p.px, p.py);
              drawing = true;
            } else {
              ctx.lineTo(p.px, p.py);
            }
          } else {
            drawing = false;
          }
        }
        ctx.stroke();
      }

      // ── Layer 5: Country Borders ──
      ctx.strokeStyle = isDark ? "rgba(255, 255, 255, 0.22)" : "rgba(15, 23, 42, 0.22)";
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 3]);
      for (const line of BORDER_PATHS) {
        ctx.beginPath();
        let drawing = false;
        for (let i = 0; i < line.length; i++) {
          const p = project(line[i]);
          if (p.z > 0.02) {
            if (!drawing) {
              ctx.moveTo(p.px, p.py);
              drawing = true;
            } else {
              ctx.lineTo(p.px, p.py);
            }
          } else {
            drawing = false;
          }
        }
        ctx.stroke();
      }
      ctx.setLineDash([]); // Reset line dash

      // ── Layer 6: Tactile Dropped Pin Location Anchor ──
      const [lat, lng] = targetCoordinates;
      const targetUnit = toUnitSphere(lat, lng);
      const targetP = project(targetUnit);

      if (targetP.z > -0.1) {
        const beaconAlpha = Math.max(0.15, Math.min(1.0, (targetP.z + 0.1) / 0.8));

        // Ground anchor base
        ctx.beginPath();
        ctx.arc(targetP.px, targetP.py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${beaconAlpha * 0.35})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(16, 185, 129, ${beaconAlpha * 0.7})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(targetP.px, targetP.py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${beaconAlpha})`;
        ctx.fill();

        // 3D Physical Pin Needle (rising vertically 16px from surface)
        const pinHeadY = targetP.py - 16;
        ctx.beginPath();
        ctx.moveTo(targetP.px, targetP.py);
        ctx.lineTo(targetP.px, pinHeadY);
        ctx.strokeStyle = `rgba(16, 185, 129, ${beaconAlpha})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Pin Head Ambient Halo
        ctx.beginPath();
        ctx.arc(targetP.px, pinHeadY, 6.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${beaconAlpha * 0.22})`;
        ctx.fill();

        // Pin Head Body (Emerald marker with crisp stroke)
        ctx.beginPath();
        ctx.arc(targetP.px, pinHeadY, 4.0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${beaconAlpha})`;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Inner specular white center
        ctx.beginPath();
        ctx.arc(targetP.px - 0.8, pinHeadY - 0.8, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }

      ctx.restore(); // Restore clip

      // Specular highlight on top-left of sphere
      const specular = ctx.createRadialGradient(
        cx - radius * 0.45,
        cy - radius * 0.45,
        radius * 0.05,
        cx - radius * 0.45,
        cy - radius * 0.45,
        radius * 0.65
      );
      specular.addColorStop(0, isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.5)");
      specular.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = specular;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // Restore scale

      // Idle battery check: If not dragging, not slerping, and either reduced motion or static velocity at locked location
      const isIdle =
        !isDraggingRef.current &&
        !isSlerpingRef.current &&
        (shouldReduceMotionRef.current ||
          (isLocationLockedRef.current &&
            Math.abs(velocityPhiRef.current) < 0.0001 &&
            Math.abs(velocityThetaRef.current) < 0.0001));

      if (isIdle) {
        isRunning = false;
        animationFrameId = null;
      } else {
        animationFrameId = requestAnimationFrame(render);
      }
    }

    function requestRender() {
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    }
    requestRenderRef.current = requestRender;

    function resize() {
      const parent = canvas.parentElement;
      width = parent?.clientWidth || 320;
      height = Math.max(260, Math.min(320, parent?.clientHeight || 280));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      requestRender();
    }

    resize();
    window.addEventListener("resize", resize);
    requestRender();

    return () => {
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, [targetCoordinates]);

  // Pointer interaction for drag-to-spin and tap-to-select
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    isSlerpingRef.current = false;
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    velocityPhiRef.current = 0;
    velocityThetaRef.current = 0;
    requestRenderRef.current();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;

    // Detect if finger moved enough to be a true drag gesture
    const totalDist = Math.hypot(
      e.clientX - pointerDownPosRef.current.x,
      e.clientY - pointerDownPosRef.current.y
    );
    if (totalDist > 5) {
      isLocationLockedRef.current = false;
    }

    // Natural 1:1 tactile drag (inverted from previous opposite behavior)
    const SENSITIVITY = 0.007;
    phiRef.current -= dx * SENSITIVITY;
    thetaRef.current -= dy * SENSITIVITY;

    // Track instantaneous velocity
    velocityPhiRef.current = -dx * SENSITIVITY * 0.45;
    velocityThetaRef.current = -dy * SENSITIVITY * 0.45;

    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    requestRenderRef.current();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    requestRenderRef.current();
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    // Tap/Click detection: check if pointer barely moved
    const moveDist = Math.hypot(
      e.clientX - pointerDownPosRef.current.x,
      e.clientY - pointerDownPosRef.current.y
    );
    const pressDuration = Date.now() - pointerDownPosRef.current.time;

    if (moveDist < 6 && pressDuration < 450) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.44;

      const nx = (clickX - cx) / radius;
      const ny = (clickY - cy) / radius;
      const distSq = nx * nx + ny * ny;

      // Ensure tap landed on the visible Earth hemisphere
      if (distSq <= 1.0) {
        const nz = Math.sqrt(Math.max(0, 1.0 - distSq));
        const curPhi = phiRef.current;
        const curTheta = thetaRef.current;
        const cosT = Math.cos(curTheta);
        const sinT = Math.sin(curTheta);
        const cosP = Math.cos(curPhi);
        const sinP = Math.sin(curPhi);

        // Inverse projection: un-tilt theta, then un-rotate phi
        const pt_y = ny * cosT + nz * sinT;
        const z1 = nz * cosT - ny * sinT;
        const pt_x = nx * cosP + z1 * sinP;
        const pt_z = z1 * cosP - nx * sinP;

        const lat = -Math.asin(Math.max(-1, Math.min(1, pt_y))) * (180 / Math.PI);
        const lng = Math.atan2(pt_x, pt_z) * (180 / Math.PI);

        isLocationLockedRef.current = true;
        if (onCoordinatesChange) {
          onCoordinatesChange([lat, lng]);
        }
      }
    }
  };

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-[270px] cursor-grab active:cursor-grabbing touch-none"
        aria-label="Interactive 3D Earth Globe with Country Outlines"
      />
    </div>
  );
}
