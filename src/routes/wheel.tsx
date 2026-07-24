import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarClock,
  Gift,
  Lock,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  createWheelReward,
  getCurrentMonthKey,
  getWheelReward,
  hasSpunThisMonth,
  markSpinForCurrentMonth,
  saveWheelReward,
} from "@/lib/wheelReward";

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

const wheelColors = [
  "#7c3aed",
  "#111827",
  "#2563eb",
  "#16a34a",
  "#111827",
  "#f59e0b",
  "#dc2626",
  "#111827",
];

const SPIN_DURATION = 5000;

function WheelGame() {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState("");
  const [alreadySpun, setAlreadySpun] = useState(false);

  const slice = 360 / prizes.length;

  useEffect(() => {
    const spunThisMonth = hasSpunThisMonth();
    setAlreadySpun(spunThisMonth);

    if (spunThisMonth) {
      const existingReward = getWheelReward();

      if (
        existingReward &&
        existingReward.spinMonth === getCurrentMonthKey() &&
        !existingReward.used
      ) {
        setResult(existingReward.label);
      }
    }
  }, []);

  const wheelBackground = useMemo(() => {
    const colorParts = wheelColors.map(
      (color, index) => {
        const start = index * slice;
        const end = start + slice;

        return `${color} ${start}deg ${end}deg`;
      }
    );

    return `conic-gradient(${colorParts.join(", ")})`;
  }, [slice]);

  const spinWheel = () => {
    if (spinning || alreadySpun) return;

    setSpinning(true);
    setResult("");

    /*
      On choisit d'abord le gagnant.

      Ensuite on calcule la rotation pour que le CENTRE
      exact de sa tranche arrive sous la flèche placée en haut.
    */
    const winningIndex = Math.floor(
      Math.random() * prizes.length
    );

    const winningPrize = prizes[winningIndex];

    const targetCenterAngle =
      winningIndex * slice + slice / 2;

    /*
      La flèche est à 0° en haut.

      Pour mettre targetCenterAngle sous la flèche,
      la rotation finale modulo 360 doit être :
      360 - targetCenterAngle.
    */
    const desiredRotation =
      (360 - targetCenterAngle) % 360;

    const currentNormalized =
      ((rotation % 360) + 360) % 360;

    const correction =
      (desiredRotation - currentNormalized + 360) % 360;

    const completeTurns =
      6 + Math.floor(Math.random() * 3);

    const newRotation =
      rotation + completeTurns * 360 + correction;

    /*
      On enregistre immédiatement le mois.
      Même en rechargeant la page pendant l'animation,
      l'utilisateur ne pourra pas rejouer.
    */
    markSpinForCurrentMonth();
    setAlreadySpun(true);
    setRotation(newRotation);

    window.setTimeout(() => {
      const reward = createWheelReward(winningPrize);

      saveWheelReward(reward);
      setResult(winningPrize);
      setSpinning(false);
    }, SPIN_DURATION);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-16 text-foreground sm:px-6 md:py-20">
      {/* BACKGROUND */}
      <div className="bg-grid pointer-events-none fixed inset-0 opacity-20" />

      <div className="pointer-events-none fixed left-10 top-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />

      <div className="pointer-events-none fixed bottom-10 right-10 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl text-center">
        <Link
          to="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour accueil
        </Link>

        {/* HEADER */}
        <div className="mb-10">
          <div className="glass mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-primary">
            <Sparkles className="h-4 w-4" />
            JEU CADEAU
          </div>

          <h1 className="font-display text-5xl font-bold md:text-7xl">
            Roue des{" "}
            <span className="gradient-text">
              cadeaux
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Tourne la roue et gagne une réduction.
            Une seule participation est autorisée par mois.
          </p>
        </div>

        {/* WHEEL */}
        <div className="relative mx-auto mb-10 flex h-[330px] w-[330px] items-center justify-center sm:h-[380px] sm:w-[380px] md:h-[460px] md:w-[460px]">
          {/* POINTER */}
          <div className="absolute -top-3 z-40 flex flex-col items-center">
            <div className="h-7 w-7 rounded-full border-4 border-background bg-primary shadow-xl" />

            <div className="-mt-1 h-0 w-0 border-l-[22px] border-r-[22px] border-t-[44px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
          </div>

          {/* GLOW */}
          <div className="absolute h-full w-full rounded-full bg-primary/20 blur-2xl" />

          {/* ROTATING WHEEL */}
          <div
            className="relative h-full w-full rounded-full border-[10px] border-primary shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? `transform ${SPIN_DURATION}ms cubic-bezier(0.12, 0.72, 0.18, 1)`
                : "none",
              background: wheelBackground,
            }}
          >
            <div className="absolute inset-4 rounded-full border-4 border-white/20" />

            <div className="absolute inset-12 rounded-full border border-white/10" />

            {/* SEPARATION LINES */}
            {prizes.map((_, index) => {
              const lineAngle = index * slice;

              return (
                <div
                  key={`line-${index}`}
                  className="absolute left-1/2 top-1/2 h-1/2 w-[2px] origin-bottom bg-white/30"
                  style={{
                    transform: `
                      translateX(-50%)
                      translateY(-100%)
                      rotate(${lineAngle}deg)
                    `,
                  }}
                />
              );
            })}

            {/* LABELS */}
            {prizes.map((prize, index) => {
              const angle =
                index * slice + slice / 2;

              return (
                <div
                  key={`${prize}-${index}`}
                  className="absolute left-1/2 top-1/2 flex w-28 items-center justify-center text-center text-[10px] font-black leading-tight text-white drop-shadow-xl sm:w-32 sm:text-xs"
                  style={{
                    transform: `
                      rotate(${angle}deg)
                      translateY(clamp(-185px, -38vw, -125px))
                      rotate(-${angle}deg)
                    `,
                    transformOrigin: "center center",
                    marginLeft: "-64px",
                    marginTop: "-18px",
                  }}
                >
                  <span className="rounded-lg bg-black/20 px-2 py-1 backdrop-blur-sm">
                    {prize}
                  </span>
                </div>
              );
            })}
          </div>

          {/* CENTER BUTTON */}
          <button
            type="button"
            onClick={spinWheel}
            disabled={spinning || alreadySpun}
            className="absolute z-30 flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-background shadow-xl transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 md:h-32 md:w-32"
          >
            <div>
              {alreadySpun && !spinning ? (
                <Lock className="mx-auto h-8 w-8 text-primary md:h-10 md:w-10" />
              ) : (
                <Gift className="mx-auto h-8 w-8 text-primary md:h-10 md:w-10" />
              )}

              <p className="mt-1 text-xs font-bold md:text-sm">
                {spinning
                  ? "..."
                  : alreadySpun
                    ? "UTILISÉ"
                    : "SPIN"}
              </p>
            </div>
          </button>
        </div>

        {/* MAIN BUTTON */}
        <Button
          type="button"
          onClick={spinWheel}
          disabled={spinning || alreadySpun}
          className="gradient-primary glow-primary h-12 border-0 px-10 text-primary-foreground"
        >
          {spinning
            ? "La roue tourne..."
            : alreadySpun
              ? "Participation déjà utilisée"
              : "Tourner la roue"}
        </Button>

        {alreadySpun && !spinning && (
          <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="h-4 w-4" />
            Tu pourras rejouer le mois prochain.
          </div>
        )}

        {/* RESULT */}
        {result && !spinning && (
          <div className="mx-auto mt-8 max-w-md rounded-3xl border bg-card p-6 shadow-card">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-primary" />

            <h2 className="text-3xl font-bold">
              Bravo 🎁
            </h2>

            <p className="gradient-text mt-2 text-xl font-bold">
              {result}
            </p>

            <p className="mt-3 text-sm text-muted-foreground">
              Ton offre est disponible dans la page des
              produits. Elle sera utilisée une seule fois.
            </p>

            <Button
              className="gradient-primary mt-5 border-0"
              asChild
            >
              <Link to="/#subscriptions">
                Voir les produits
              </Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
