import GameBoard from "@/components/game-board";

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen">
      <header className="text-center pt-6 pb-2 w-full max-w-[900px]">
        <h1 className="text-3xl font-bold tracking-wider">
          Lo<span className="text-[var(--color-accent)]">L</span>dle
        </h1>
      </header>
      <GameBoard />
    </main>
  );
}
