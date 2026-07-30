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
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  createWheelReward,
  getWheelReward,
  hasSpunThisMonth,
  markSpinForCurrentMonth,
} from "@/lib/wheelReward";

import {
  getActiveWheelPrizes,
  type WheelPrize,
} from "@/lib/wheelConfig";

export const Route = createFileRoute("/wheel")({
  component: WheelGame,
});

const SPIN_DURATION = 5000;
const REQUIRED_PRIZES_COUNT = 8;

function WheelGame() {
  const [prizes, setPrizes] =
    useState<WheelPrize[]>([]);

  const [spinning, setSpinning] =
    useState(false);

  const [rotation, setRotation] =
    useState(0);

  const [result, setResult] =
    useState("");

  const [alreadySpun, setAlreadySpun] =
    useState(false);

  /*
    Le nombre de sections dépend
    des récompenses actives.

    La configuration valide doit
    contenir exactement 8 récompenses.
  */
  const slice =
    prizes.length > 0
      ? 360 / prizes.length
      : 360 / REQUIRED_PRIZES_COUNT;

  /*
    Calcul automatique du total.

    Les valeurs viennent de la page Admin.
    Aucun pourcentage n'est écrit ici.
  */
  const totalPercentage = useMemo(() => {
    return prizes.reduce(
      (total, prize) => {
        return (
          total +
          (Number(prize.percentage) || 0)
        );
      },
      0
    );
  }, [prizes]);

  const hasEightPrizes =
    prizes.length ===
    REQUIRED_PRIZES_COUNT;

  /*
    On utilise une petite tolérance
    pour éviter les problèmes comme
    99.999999 à cause des décimales.
  */
  const hasValidPercentageTotal =
    Math.abs(totalPercentage - 100) <
    0.001;

  const isConfigurationValid =
    hasEightPrizes &&
    hasValidPercentageTotal;

  useEffect(() => {
    const loadPrizes = () => {
      /*
        Les récompenses viennent
        directement de la configuration Admin.
      */
      const activePrizes =
        getActiveWheelPrizes();

      setPrizes(activePrizes);
    };

    loadPrizes();

    const spunThisMonth =
      hasSpunThisMonth();

    setAlreadySpun(spunThisMonth);

    if (spunThisMonth) {
      const existingReward =
        getWheelReward();

      if (
        existingReward &&
        !existingReward.used
      ) {
        setResult(existingReward.label);
      }
    }

    /*
      Actualisation automatique après
      une modification depuis l'Admin.
    */
    window.addEventListener(
      "wheel-config-updated",
      loadPrizes
    );

    /*
      Permet aussi de détecter les
      modifications dans un autre onglet.
    */
    window.addEventListener(
      "storage",
      loadPrizes
    );

    return () => {
      window.removeEventListener(
        "wheel-config-updated",
        loadPrizes
      );

      window.removeEventListener(
        "storage",
        loadPrizes
      );
    };
  }, []);

  /*
    Création dynamique des couleurs
    de la roue depuis les données Admin.
  */
  const wheelBackground =
    useMemo(() => {
      if (prizes.length === 0) {
        return "#111827";
      }

      const currentSlice =
        360 / prizes.length;

      const colorParts = prizes.map(
        (prize, index) => {
          const start =
            index * currentSlice;

          const end =
            start + currentSlice;

          const color =
            prize.color || "#7c3aed";

          return `${color} ${start}deg ${end}deg`;
        }
      );

      return `conic-gradient(${colorParts.join(
        ", "
      )})`;
    }, [prizes]);

  const spinWheel = () => {
    if (
      spinning ||
      alreadySpun ||
      !isConfigurationValid
    ) {
      return;
    }

    setSpinning(true);
    setResult("");

    /*
      Une chance égale pour chaque case.

      Avec 8 cases :
      chaque récompense a 12,5 %
      de probabilité de sortir.

      prize.percentage représente
      la remise gagnée.
  */
    const winningIndex =
      Math.floor(
        Math.random() * prizes.length
      );

    const winningPrize =
      prizes[winningIndex];

    if (!winningPrize) {
      setSpinning(false);
      return;
    }

    const targetCenterAngle =
      winningIndex * slice +
      slice / 2;

    /*
      Correction pour le pointeur
      positionné en haut de la roue.
    */
    const desiredRotation =
      (360 - targetCenterAngle) % 360;

    const currentNormalized =
      ((rotation % 360) + 360) %
      360;

    const correction =
      (
        desiredRotation -
        currentNormalized +
        360
      ) % 360;

    const completeTurns =
      6 +
      Math.floor(Math.random() * 3);

    const newRotation =
      rotation +
      completeTurns * 360 +
      correction;

    markSpinForCurrentMonth();

    setAlreadySpun(true);
    setRotation(newRotation);

    window.setTimeout(() => {
      const reward =
        createWheelReward({
          id: winningPrize.id,
          label: winningPrize.label,
          percentage:
            Number(
              winningPrize.percentage
            ) || 0,
          productName:
            winningPrize.productName,
        });

      setResult(reward.label);
      setSpinning(false);
    }, SPIN_DURATION);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-16 text-foreground sm:px-6 md:py-20">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-20" />

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
            Tourne la roue et gagne une
            réduction sur l’un de nos
            produits. Une seule
            participation est autorisée
            par mois.
          </p>
        </div>

        {prizes.length === 0 ? (
          <div className="mx-auto max-w-md rounded-3xl border bg-card p-8 shadow-card">
            <Gift className="mx-auto mb-4 h-10 w-10 text-primary" />

            <h2 className="text-2xl font-bold">
              Aucune récompense active
            </h2>

            <p className="mt-3 text-sm text-muted-foreground">
              Ajoute et active les
              récompenses depuis la page
              Admin.
            </p>
          </div>
        ) : !isConfigurationValid ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-destructive/40 bg-destructive/10 p-8">
            <TriangleAlert className="mx-auto mb-4 h-11 w-11 text-destructive" />

            <h2 className="text-2xl font-bold text-destructive">
              Configuration incorrecte
            </h2>

            <p className="mt-4 text-sm text-muted-foreground">
              Corrige la configuration
              depuis la page Admin avant
              d’utiliser la roue.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-background/50 p-4">
                <p className="text-xs text-muted-foreground">
                  Récompenses actives
                </p>

                <p
                  className={`mt-1 text-xl font-bold ${
                    hasEightPrizes
                      ? "text-green-500"
                      : "text-destructive"
                  }`}
                >
                  {prizes.length} / 8
                </p>
              </div>

              <div className="rounded-2xl border bg-background/50 p-4">
                <p className="text-xs text-muted-foreground">
                  Total des remises
                </p>

                <p
                  className={`mt-1 text-xl font-bold ${
                    hasValidPercentageTotal
                      ? "text-green-500"
                      : "text-destructive"
                  }`}
                >
                  {totalPercentage} %
                </p>
              </div>
            </div>

            {!hasEightPrizes && (
              <p className="mt-5 text-sm font-semibold text-destructive">
                Il faut exactement huit
                récompenses actives.
              </p>
            )}

            {!hasValidPercentageTotal && (
              <p className="mt-2 text-sm font-semibold text-destructive">
                Le total des pourcentages
                saisis dans l’Admin doit
                être égal à 100 %.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="relative mx-auto mb-10 flex h-[330px] w-[330px] items-center justify-center sm:h-[380px] sm:w-[380px] md:h-[460px] md:w-[460px]">
              {/* Pointeur */}

              <div className="absolute -top-3 z-40 flex flex-col items-center">
                <div className="h-7 w-7 rounded-full border-4 border-background bg-primary shadow-xl" />

                <div className="-mt-1 h-0 w-0 border-l-[22px] border-r-[22px] border-t-[44px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
              </div>

              {/* Lumière */}

              <div className="absolute h-full w-full rounded-full bg-primary/20 blur-2xl" />

              {/* Roue */}

              <div
                className="relative h-full w-full overflow-hidden rounded-full border-[10px] border-primary shadow-2xl"
                style={{
                  transform: `rotate(${rotation}deg)`,

                  transition: spinning
                    ? `transform ${SPIN_DURATION}ms cubic-bezier(0.12, 0.72, 0.18, 1)`
                    : "none",

                  background:
                    wheelBackground,
                }}
              >
                <div className="absolute inset-4 rounded-full border-4 border-white/20" />

                <div className="absolute inset-12 rounded-full border border-white/10" />

                {/* Séparations */}

                {prizes.map(
                  (_, index) => {
                    const lineAngle =
                      index * slice;

                    return (
                      <div
                        key={`line-${index}`}
                        className="absolute left-1/2 top-1/2 h-1/2 w-[2px] origin-bottom bg-white/40"
                        style={{
                          transform: `
                            translateX(-50%)
                            translateY(-100%)
                            rotate(${lineAngle}deg)
                          `,
                        }}
                      />
                    );
                  }
                )}

                {/* Récompenses */}

                {prizes.map(
                  (prize, index) => {
                    const angle =
                      index * slice +
                      slice / 2;

                    return (
                      <div
                        key={prize.id}
                        className="absolute left-1/2 top-1/2 flex w-24 items-center justify-center text-center text-[9px] font-black leading-tight text-white drop-shadow-xl sm:w-28 sm:text-[11px] md:w-32 md:text-xs"
                        style={{
                          transform: `
                            rotate(${angle}deg)
                            translateY(clamp(-185px, -38vw, -125px))
                            rotate(-${angle}deg)
                          `,

                          transformOrigin:
                            "center center",

                          marginLeft:
                            "-56px",

                          marginTop:
                            "-20px",
                        }}
                      >
                        <span className="rounded-lg bg-black/25 px-2 py-1.5 backdrop-blur-sm">
                          {prize.productName}
                          <br />
                          -{prize.percentage}%
                        </span>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Bouton central */}

              <button
                type="button"
                onClick={spinWheel}
                disabled={
                  spinning ||
                  alreadySpun ||
                  !isConfigurationValid
                }
                className="absolute z-30 flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-background shadow-xl transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 md:h-32 md:w-32"
              >
                <div>
                  {alreadySpun &&
                  !spinning ? (
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

            <Button
              type="button"
              onClick={spinWheel}
              disabled={
                spinning ||
                alreadySpun ||
                !isConfigurationValid
              }
              className="gradient-primary glow-primary h-12 border-0 px-10 text-primary-foreground"
            >
              {spinning
                ? "La roue tourne..."
                : alreadySpun
                  ? "Participation déjà utilisée"
                  : "Tourner la roue"}
            </Button>
          </>
        )}

        {alreadySpun &&
          !spinning && (
            <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" />

              Tu pourras rejouer le mois
              prochain.
            </div>
          )}

        {result &&
          !spinning && (
            <div className="mx-auto mt-8 max-w-md rounded-3xl border bg-card p-6 shadow-card">
              <Trophy className="mx-auto mb-3 h-10 w-10 text-primary" />

              <h2 className="text-3xl font-bold">
                Bravo 🎁
              </h2>

              <p className="gradient-text mt-2 text-xl font-bold">
                {result}
              </p>

              <p className="mt-3 text-sm text-muted-foreground">
                Ton offre est disponible
                dans la page des produits.
                Elle sera utilisée une seule
                fois.
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
