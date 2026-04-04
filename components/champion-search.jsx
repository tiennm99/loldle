"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { searchChampions, getChampionImageUrl } from "@/lib/champion-data";

/** Autocomplete search input for champion selection */
export default function ChampionSearch({ excludeNames, onSelect, disabled }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Derive matches from query
  const matches = useMemo(() => {
    if (!query.trim()) return [];
    return searchChampions(query, excludeNames);
  }, [query, excludeNames]);

  // Derive dropdown open state from matches (no effect needed)
  const isVisible = isOpen && matches.length > 0;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectChampion = useCallback(
    (champion) => {
      setQuery("");
      setIsOpen(false);
      onSelect(champion);
    },
    [onSelect],
  );

  function handleKeyDown(e) {
    if (!isVisible || !matches.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < matches.length) {
        selectChampion(matches[activeIndex]);
      }
    }
  }

  return (
    <div className="relative w-full max-w-[400px] mx-auto px-4">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? "Game over" : "Type a champion name..."}
        autoComplete="off"
        className="w-full px-4 py-3 rounded-lg bg-[var(--color-input-bg)] border-2 border-[var(--color-input-border)] text-[var(--color-text)] text-base outline-none transition-colors focus:border-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[var(--color-text-muted)]"
      />

      {isVisible && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-4 right-4 bg-[var(--color-surface)] border border-[var(--color-input-border)] rounded-b-lg max-h-80 overflow-y-auto z-50"
        >
          {matches.map((champion, i) => (
            <div
              key={champion.id}
              onClick={() => selectChampion(champion)}
              className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors ${
                i === activeIndex ? "bg-[var(--color-surface-hover)]" : "hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <Image
                src={getChampionImageUrl(champion.id)}
                alt={champion.name}
                width={36}
                height={36}
                className="rounded object-cover"
                unoptimized
              />
              <span className="text-sm">{champion.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
