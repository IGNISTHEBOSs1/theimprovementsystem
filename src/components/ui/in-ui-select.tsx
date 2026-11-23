// src/components/ui/in-ui-select.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, Globe, Compass } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptics";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  group?: string;
}

interface InUiSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  recommendedValues?: string[];
  disabled?: boolean;
  className?: string;
}

export function InUiSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option…",
  searchPlaceholder = "Search…",
  recommendedValues = [],
  disabled = false,
  className,
}: InUiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      // Auto-focus search input when opened
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query) ||
        (opt.group && opt.group.toLowerCase().includes(query))
    );
  }, [options, searchQuery]);

  // Group filtered options
  const groupedOptions = useMemo(() => {
    const groups: Record<string, SelectOption[]> = {};
    for (const opt of filteredOptions) {
      const g = opt.group || "Options";
      if (!groups[g]) groups[g] = [];
      groups[g].push(opt);
    }
    return Object.entries(groups);
  }, [filteredOptions]);

  const handleSelect = (val: string) => {
    triggerHaptic.light();
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  const toggleDropdown = () => {
    if (disabled) return;
    triggerHaptic.light();
    setIsOpen((prev) => !prev);
    if (!isOpen) setSearchQuery("");
  };

  return (
    <div ref={containerRef} className={cn("relative w-full select-none", className)}>
      {/* Trigger Button rendered completely in Kinetic neoskeuomorphic UI */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={cn(
          "w-full min-h-11 px-3.5 py-2.5 rounded-xl border border-input bg-background/60",
          "flex items-center justify-between text-xs sm:text-sm text-foreground",
          "focus:border-foreground/50 focus-visible:ring-1 focus-visible:ring-foreground/20",
          "shadow-2xs cursor-pointer active:scale-[0.99] transition-colors",
          isOpen && "border-emerald-500/50 ring-1 ring-emerald-500/30",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <Globe className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          {selectedOption ? (
            <span className="font-medium text-foreground">{selectedOption.label}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-foreground"
          )}
        />
      </button>

      {/* Floating In-UI Custom Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute left-0 right-0 top-full mt-1.5 z-50",
              "rounded-xl border border-border/80 dark:border-white/10",
              "bg-card/95 dark:bg-[#090D16]/95 backdrop-blur-2xl shadow-2xl",
              "overflow-hidden p-1.5 space-y-1.5 max-h-72 flex flex-col"
            )}
          >
            {/* Search Filter Header */}
            <div className="relative px-1 pt-0.5">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn(
                  "w-full h-9 pl-9 pr-3 rounded-lg text-xs",
                  "border border-border/60 dark:border-white/10",
                  "bg-muted/40 dark:bg-slate-900/60 text-foreground placeholder:text-muted-foreground/60",
                  "focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/40"
                )}
              />
            </div>

            {/* Scrollable List Container */}
            <div className="flex-1 overflow-y-auto px-1 space-y-2.5 max-h-56 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground font-mono">
                  No matching region found.
                </div>
              ) : (
                groupedOptions.map(([groupName, groupItems]) => (
                  <div key={groupName} className="space-y-0.5">
                    <div className="px-2 py-1 text-xs font-mono font-medium text-muted-foreground/80 flex items-center gap-1">
                      {groupName === "Recommended" && <Compass className="h-3 w-3 text-emerald-400" />}
                      <span>{groupName}</span>
                    </div>

                    <div className="grid gap-0.5">
                      {groupItems.map((opt) => {
                        const isSelected = opt.value === value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className={cn(
                              "w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer",
                              isSelected
                                ? "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30"
                                : "text-foreground hover:bg-muted/60 dark:hover:bg-white/5"
                            )}
                          >
                            <span className="truncate flex-1">{opt.label}</span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-emerald-400 ml-2 shrink-0 stroke-[2.5]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
