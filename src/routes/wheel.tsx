import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Gift, Sparkles, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/wheel")({
  component: WheelGame,
});

const prizes = [
  "Gemini Pro -25%",
  "5% sur votre achat",
  "Spotify -10%",
  "5% sur votre achat",
  "Canva -50%",
  "5% sur votre achat",
  "LinkedIn -15%",
  "2K Followers -10%",
];

function WheelGame() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
const saveReward = (reward: string) => {
  localStorage.setItem("wheelReward", reward);
  window.dispatchEvent(new Event("wheel-reward-updated"));
};
  const spinWheel = () => {
  if (spinning) return;

  setSpinning(true);
  setResult("");

  const slice = 360 / prizes.length;
  const spins = 6 + Math.floor(Math.random() * 4);
  const extraRotation = Math.random() * 360;

  const newRotation = rotation + spins * 360 + extraRotation;

  setRotation(newRotation);

  setTimeout(() => {
    const normalized = ((newRotation % 360) + 360) % 360;

    // flèche en haut + correction demi-tranche
    const pointerAngle =
      (360 - normalized + 22.5) % 360;

    const winningIndex =
      Math.floor(pointerAngle / slice);
console.log({
  normalized,
  pointerAngle,
  winningIndex,
  prize: prizes[winningIndex],
});
    const reward = prizes[winningIndex];
setResult(reward);
saveReward(reward);
    setSpinning(false);
  }, 4500);
};

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-20 text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-20" />
      <div className="pointer-events-none fixed left-10 top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 right-10 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl text-center">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour accueil
        </Link>

        <div className="mb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-primary glass">
            <Sparkles className="h-4 w-4" />
            JEU CADEAU
          </div>

          <h1 className="font-display text-5xl font-bold md:text-7xl">
            Roue des <span className="gradient-text">cadeaux</span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Tourne la roue et tente de gagner une réduction ou un cadeau.
          </p>
        </div>

        <div className="relative mx-auto mb-10 flex h-[360px] w-[360px] items-center justify-center md:h-[460px] md:w-[460px]">
          <div className="absolute -top-5 z-30 h-0 w-0 border-l-[24px] border-r-[24px] border-t-[46px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />

          <div className="absolute h-full w-full rounded-full bg-primary/20 blur-2xl" />

          <div
            className="relative h-full w-full rounded-full border-[10px] border-primary shadow-2xl transition-transform duration-[4500ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background:
                "conic-gradient(#7c3aed 0deg 45deg, #111827 45deg 90deg, #2563eb 90deg 135deg, #16a34a 135deg 180deg, #111827 180deg 225deg, #f59e0b 225deg 270deg, #dc2626 270deg 315deg, #111827 315deg 360deg)",
            }}
          >
            <div className="absolute inset-4 rounded-full border-4 border-white/20" />
            <div className="absolute inset-12 rounded-full border border-white/10" />

            {prizes.map((prize, index) => {
              const angle = index * 45 + 22.5;

              return (
                <div
                  key={prize + index}
                  className="absolute left-1/2 top-1/2 flex w-32 items-center justify-center text-center text-xs font-black leading-tight text-white drop-shadow-xl"
                  style={{
                    transform: `
                      rotate(${angle}deg)
                      translateY(-145px)
                      rotate(-${angle}deg)
                    `,
                    transformOrigin: "center center",
                    marginLeft: "-64px",
                    marginTop: "-20px",
                  }}
                >
                  <span className="rounded-lg bg-black/20 px-2 py-1 backdrop-blur-sm">
                    {prize}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            onClick={spinWheel}
            disabled={spinning}
            className="absolute z-20 flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-background shadow-xl transition hover:scale-105 disabled:opacity-70 md:h-32 md:w-32"
          >
            <div>
              <Gift className="mx-auto h-8 w-8 text-primary md:h-10 md:w-10" />
              <p className="mt-1 text-xs font-bold md:text-sm">
                {spinning ? "..." : "SPIN"}
              </p>
            </div>
          </button>
        </div>

        <Button
          onClick={spinWheel}
          disabled={spinning}
          className="h-12 border-0 gradient-primary px-10 text-primary-foreground glow-primary"
        >
          {spinning ? "La roue tourne..." : "Tourner la roue"}
        </Button>

        {result && (
          <div className="mx-auto mt-8 max-w-md rounded-3xl border bg-card p-6 shadow-card">
            <>
              <Trophy className="mx-auto mb-3 h-10 w-10 text-primary" />
              <h2 className="text-3xl font-bold">Bravo 🎁</h2>
              <p className="mt-2 text-xl font-bold gradient-text">{result}</p>
            </>
          </div>
        )}
      </div>
    </main>
  );
}