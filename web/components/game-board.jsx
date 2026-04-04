"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  loadChampions,
  getRandomChampion,
  getTodaySeed,
} from "@/lib/champion-data";
import {
  createGame,
  submitGuess,
  getGuessedNames,
  getOrCreateUnlimitedSeed,
  clearUnlimitedState,
  saveUnlimitedStats,
  loadUnlimitedStats,
  clearExpiredCache,
} from "@/lib/game-engine";
import { compareChampions } from "@/lib/classic-mode";
import ChampionSearch from "./champion-search";
import GuessGrid from "./guess-grid";
import GameOver from "./game-over";
import StatsDisplay from "./stats-display";

export default function GameBoard() {
  const [mode, setMode] = useState("daily");
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const gameRef = useRef(null);

  const initGame = useCallback((gameMode) => {
    const seed = gameMode === "daily" ? getTodaySeed() : getOrCreateUnlimitedSeed();
    const target = getRandomChampion(seed);
    const maxGuesses = gameMode === "daily" ? 6 : 0;

    const newGame = createGame({
      target,
      compareFn: compareChampions,
      maxGuesses,
      mode: gameMode,
      seed,
    });

    gameRef.current = newGame;
    setGame({ ...newGame });
    setStats(gameMode === "unlimited" ? loadUnlimitedStats() : null);
  }, []);

  useEffect(() => {
    loadChampions()
      .then(() => {
        clearExpiredCache(getTodaySeed());
        initGame("daily");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [initGame]);

  function switchMode(newMode) {
    setMode(newMode);
    initGame(newMode);
  }

  const handleGuess = useCallback((champion) => {
    const currentGame = gameRef.current;
    if (!currentGame) return;

    const updated = submitGuess(currentGame, champion);
    if (!updated) return;

    gameRef.current = updated;
    setGame(updated);

    if (updated.isOver && updated.mode === "unlimited") {
      saveUnlimitedStats(updated);
      setStats(loadUnlimitedStats());
    }
  }, []);

  function handleNewGame() {
    clearUnlimitedState();
    initGame("unlimited");
  }

  if (loading) {
    return <p className="text-center text-[var(--color-text-muted)] py-8">Loading champions...</p>;
  }

  if (error) {
    return <p className="text-center text-[var(--color-wrong)] py-8">Failed to load champion data. Please refresh.</p>;
  }

  if (!game) return null;

  const excludeNames = game.guesses.map((g) => g.name);

  return (
    <>
      {/* Mode toggle */}
      <div className="flex justify-center gap-1 my-3 bg-[var(--color-surface)] rounded-lg p-1 w-fit mx-auto">
        <button
          onClick={() => switchMode("daily")}
          className={`px-5 py-2 rounded-md border-none text-sm font-medium cursor-pointer transition-all ${
            mode === "daily"
              ? "bg-[var(--color-accent)] text-[var(--color-text)]"
              : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => switchMode("unlimited")}
          className={`px-5 py-2 rounded-md border-none text-sm font-medium cursor-pointer transition-all ${
            mode === "unlimited"
              ? "bg-[var(--color-accent)] text-[var(--color-text)]"
              : "bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          Unlimited
        </button>
      </div>

      {stats && <StatsDisplay stats={stats} />}

      <ChampionSearch
        excludeNames={excludeNames}
        onSelect={handleGuess}
        disabled={game.isOver}
      />

      <p className="text-center text-[var(--color-text-muted)] text-sm my-3">
        {game.maxGuesses > 0
          ? `${game.guesses.length} / ${game.maxGuesses} guesses`
          : `${game.guesses.length} guess${game.guesses.length !== 1 ? "es" : ""}`}
      </p>

      <GuessGrid guesses={game.guesses} results={game.results} />

      {game.isOver && (
        <GameOver
          isWon={game.isWon}
          target={game.target}
          guessCount={game.guesses.length}
          onNewGame={mode === "unlimited" ? handleNewGame : undefined}
        />
      )}
    </>
  );
}
