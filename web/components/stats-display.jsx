"use client";

/** Unlimited mode stats display */
export default function StatsDisplay({ stats }) {
  if (!stats || stats.gamesPlayed === 0) return null;

  const winRate = Math.round((stats.gamesWon / stats.gamesPlayed) * 100);

  const items = [
    { value: stats.gamesPlayed, label: "Played" },
    { value: `${winRate}%`, label: "Win Rate" },
    { value: stats.gamesWon, label: "Won" },
  ];

  return (
    <div className="flex justify-center gap-6 py-3 mb-4">
      {items.map(({ value, label }) => (
        <div key={label} className="flex flex-col items-center gap-0.5">
          <span className="text-xl font-bold text-[var(--color-text)]">{value}</span>
          <span className="text-[0.7rem] text-[var(--color-text-muted)] uppercase">{label}</span>
        </div>
      ))}
    </div>
  );
}
