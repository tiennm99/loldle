"use client";

import { CLASSIC_ATTRIBUTES } from "@/lib/classic-mode";
import GuessRow from "./guess-row";

/** Grid with header row + guess rows */
export default function GuessGrid({ guesses, results }) {
  return (
    <div className="w-full max-w-[900px] px-4 overflow-x-auto">
      {/* Header row */}
      <div className="guess-row header-row">
        <div className="guess-cell header-cell">Champion</div>
        {CLASSIC_ATTRIBUTES.map((attr) => (
          <div key={attr.key} className="guess-cell header-cell">
            {attr.label}
          </div>
        ))}
      </div>

      {/* Guess rows — newest first */}
      {guesses
        .map((champion, i) => (
          <GuessRow key={champion.id} champion={champion} results={results[i]} />
        ))
        .reverse()}
    </div>
  );
}
