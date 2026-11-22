// src/components/onboarding/Stage2GeographicAnchor.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, MapPin, Globe, Clock, Check, ChevronDown, ArrowRight } from "lucide-react";
import { Keyboard } from "@capacitor/keyboard";
import { isCapacitorNative } from "@/services/otaUpdateService";
import { OnboardingGlobe } from "./OnboardingGlobe";
import { triggerHaptic } from "@/lib/haptics";
import { WORLD_COUNTRIES, CountryEntry } from "./countriesData";

interface Stage2Props {
  country: string;
  countryCode: string;
  timezone: string;
  coordinates: [number, number];
  onChange: (data: {
    country: string;
    countryCode: string;
    timezone: string;
    utcOffset: string;
    coordinates: [number, number];
  }) => void;
  onNext: () => void;
  onBack: () => void;
}

const COUNTRIES = WORLD_COUNTRIES;

export function Stage2GeographicAnchor({
  country,
  countryCode,
  timezone,
  coordinates,
  onChange,
  onNext,
  onBack,
}: Stage2Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Auto-detect matching timezone on initial mount if not yet bound
  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        const match = COUNTRIES.find(
          (c) => c.timezone === detected || detected.includes(c.code) || detected.includes(c.name)
        );
        if (match && match.name !== country) {
          onChange({
            country: match.name,
            countryCode: match.code,
            timezone: match.timezone,
            utcOffset: match.utcOffset,
            coordinates: match.coords,
          });
        }
      }
    } catch {
      // Fallback to default
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Outside click listener to dismiss in-UI dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [dropdownOpen]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const q = searchQuery.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.timezone.toLowerCase().includes(q) ||
        c.utcOffset.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectCountry = (c: CountryEntry) => {
    triggerHaptic.light();
    onChange({
      country: c.name,
      countryCode: c.code,
      timezone: c.timezone,
      utcOffset: c.utcOffset,
      coordinates: c.coords,
    });
    setDropdownOpen(false);
    setSearchQuery("");
    if (isCapacitorNative()) {
      Keyboard.hide().catch(() => {});
    }
  };

  const handleGlobeLocationSelect = (coords: [number, number]) => {
    triggerHaptic.light();
    const [lat, lng] = coords;
    let bestDist = Infinity;
    let bestCountry = COUNTRIES[0];

    for (const c of COUNTRIES) {
      const [cLat, cLng] = c.coords;
      const dLat = ((lat - cLat) * Math.PI) / 180;
      const dLng = ((lng - cLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((cLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const dist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      if (dist < bestDist) {
        bestDist = dist;
        bestCountry = c;
      }
    }

    onChange({
      country: bestCountry.name,
      countryCode: bestCountry.code,
      timezone: bestCountry.timezone,
      utcOffset: bestCountry.utcOffset,
      coordinates: bestCountry.coords,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
          Where are you operating from?
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-pretty">
          Calibrates your local day rollover and daily focus windows. Tap earth or search below.
        </p>
      </div>

      {/* In-UI Custom Searchable Region Combobox */}
      <div ref={dropdownRef} className="relative z-30">
        <label htmlFor="country-search-input" className="sr-only">
          Search country or timezone
        </label>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="country-search-input"
            type="text"
            enterKeyHint="done"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (isCapacitorNative()) {
                  Keyboard.hide().catch(() => {});
                }
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder={country ? `Current: ${country}` : "Search country or timezone..."}
            className="w-full h-11 rounded-xl border border-border/80 bg-background pl-10 pr-10 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none focus:ring-1 focus:ring-foreground/40 shadow-xs transition-colors"
          />
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="absolute right-3 p-1 text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground rounded"
            aria-label="Toggle region list"
          >
            <ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transform-none ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {dropdownOpen && (
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 max-h-56 overflow-y-auto rounded-xl border border-border/90 bg-card p-1.5 pr-2 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filteredCountries.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                No matching region found.
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.name === country;
                return (
                  <button
                    key={`${c.name}-${c.timezone}`}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-accent text-accent-foreground font-semibold border border-emerald-500/40 shadow-xs"
                        : "border border-transparent text-foreground hover:bg-muted/70"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-sm leading-none">{c.flag}</span>
                      <span>{c.name}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {c.utcOffset}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 3D Tactile Interactive Globe with Real Earth Coastlines */}
      <div className="relative rounded-2xl border border-border/80 p-2 bg-card/60 shadow-[var(--shadow-card)] overflow-hidden">
        <OnboardingGlobe
          targetCoordinates={coordinates}
          onCoordinatesChange={handleGlobeLocationSelect}
        />
      </div>

      {/* Telemetry Readout */}
      <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-border/80 bg-card p-3 shadow-xs text-xs">
        <div className="space-y-0.5 min-w-0">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
            <Globe className="h-3 w-3 text-emerald-500" /> Active Anchor
          </span>
          <p className="font-semibold text-foreground truncate">{country || "Unassigned"}</p>
        </div>
        <div className="space-y-0.5">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
            <Clock className="h-3 w-3 text-emerald-500" /> Day Rollover
          </span>
          <p className="font-semibold text-foreground">Midnight (00:00 Local)</p>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="min-h-11 px-4 sm:px-5 rounded-xl border border-border bg-card hover:bg-muted/60 text-foreground text-xs sm:text-sm font-semibold transition-colors active:scale-[0.98] motion-reduce:transform-none shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!country}
          onClick={onNext}
          className="flex-1 min-h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm tracking-wide transition-colors active:scale-[0.98] motion-reduce:transform-none shadow-xs flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <span>Confirm Location</span>
        </button>
      </div>
    </div>
  );
}
