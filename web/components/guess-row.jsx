"use client";

import Image from "next/image";
import { getChampionImageUrl } from "@/lib/champion-data";

/** Single guess row with colored attribute cells */
export default function GuessRow({ champion, results, animationDelay = 0 }) {
  return (
    <div className="guess-row">
      {/* Champion name + image */}
      <div
        className="guess-cell champion-cell"
        style={{ animationDelay: `${animationDelay}s` }}
      >
        <Image
          src={getChampionImageUrl(champion.id)}
          alt={champion.name}
          width={40}
          height={40}
          className="rounded object-cover shrink-0"
          unoptimized
        />
        <span className="text-xs font-semibold">{champion.name}</span>
      </div>

      {/* Attribute cells */}
      {results.map((r, i) => (
        <div
          key={r.key}
          className={`guess-cell cell-${r.result}`}
          style={{ animationDelay: `${animationDelay + (i + 1) * 0.08}s` }}
        >
          <span>{r.guessValue}</span>
          {r.direction && (
            <span className="font-bold text-base">
              {r.direction === "up" ? " ↑" : " ↓"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
