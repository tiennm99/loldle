"use client";

import Image from "next/image";
import { getChampionImageUrl } from "@/lib/champion-data";

/** Win/loss message with optional new game button */
export default function GameOver({ isWon, target, guessCount, onNewGame }) {
  return (
    <div className={`text-center py-6 px-4 mx-auto max-w-[400px]`}>
      <h2
        className={`text-2xl font-bold mb-2 ${
          isWon ? "text-[var(--color-correct)]" : "text-[var(--color-wrong)]"
        }`}
      >
        {isWon ? "You got it!" : "Game Over"}
      </h2>

      {isWon ? (
        <p className="text-[var(--color-text-muted)] mb-3">
          You found <strong className="text-[var(--color-text)]">{target.name}</strong> in{" "}
          <strong className="text-[var(--color-text)]">{guessCount}</strong>{" "}
          guess{guessCount > 1 ? "es" : ""}!
        </p>
      ) : (
        <>
          <p className="text-[var(--color-text-muted)] mb-3">
            The champion was <strong className="text-[var(--color-text)]">{target.name}</strong>
          </p>
          <Image
            src={getChampionImageUrl(target.id)}
            alt={target.name}
            width={80}
            height={80}
            className="rounded-lg object-cover mx-auto"
            unoptimized
          />
        </>
      )}

      {onNewGame && (
        <button
          onClick={onNewGame}
          className="mt-4 px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-[var(--color-text)] font-semibold cursor-pointer transition-opacity hover:opacity-85"
        >
          New Game
        </button>
      )}
    </div>
  );
}
