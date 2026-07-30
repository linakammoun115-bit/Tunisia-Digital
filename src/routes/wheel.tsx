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

/*
  La roue contient toujours exactement
  8 parties égales.
*/
const WHEEL_PARTS = 8;

const SLICE_ANGLE = 360 / WHEEL_PARTS;

const SPIN_DURATION = 5000;

/*
  Couleurs utilisées lorsqu'une récompense
  n'a pas de couleur valide.
*/
const DEFAULT_COLORS = [
  "#7C3AED",
  "#DB2777",
  "#2563EB",
  "#0891B2",
  "#059669",
  "#CA8A04",
  "#EA580C",
  "#DC2626",
];

type WheelSlot = {
  id: string;
  label: string;
  percentage: number;
  productName: string;
  color: string;
  configured: boolean;
};

function createWheelSlots(
  prizes: WheelPrize[]
): WheelSlot[] {
  return Array.from(
    { length: WHEEL_PARTS },
    (_, index) => {
      const prize = prizes[index];

      if (!prize) {
        return {
          id: empty-slot-${index},
          label: "À configurer",
          percentage: 0,
          productName: Produit ${index + 1},
          color: DEFAULT_COLORS[index],
          configured: false,
        };
      }

      return {
        id: prize.id,
        label:
          prize.label?.trim() ||
          "Cadeau",
        percentage:
          prize.percentage ?? 0,
        productName:
          prize.productName?.trim() ||
          Produit ${index + 1},
        color:
          prize.color?.trim() ||
          DEFAULT_COLORS[index],
        configured: true,
      };
    }
  );
}

function WheelGame() {
  const [slots, setSlots] =
    useState<WheelSlot[]>(() =>
      createWheelSlots([])
    );

  const [spinning, setSpinning] =
    useState(false);

  const [rotation, setRotation] =
    useState(0);

  const [result, setResult] =
    useState("");

  const [resultProduct, setResultProduct] =
    useState("");

  const [alreadySpun, setAlreadySpun] =
    useState(false);

  /*
    On autorise le jeu uniquement lorsque
    les 8 parties sont configurées.
  */
  const configuredSlotsCount =
    useMemo(
      () =>
        slots.filter(
          (slot) => slot.configured
        ).length,
      [slots]
    );

  const wheelIsReady =
    configuredSlotsCount === WHEEL_PARTS;

  useEffect(() => {
    const loadPrizes = () => {
      const activePrizes =
        getActiveWheelPrizes();

      /*
        La roue utilise uniquement
        les 8 premières récompenses actives.
      */
      const firstEightPrizes =
        activePrizes.slice(
          0,
          WHEEL_PARTS
        );

      setSlots(
        createWheelSlots(
          firstEightPrizes
        )
      );
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
        setResult(
          existingReward.label
        );

        setResultProduct(
          existingReward.productName ||
            ""
        );
      }
    }

    window.addEventListener(
      "wheel-config-updated",
      loadPrizes
    );

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
    Création des 8 couleurs égales.

    Chaque partie occupe 45 degrés:
    360 / 8 = 45.
  */
  const wheelBackground =
    useMemo(() => {
      const colorParts =
        slots.map(
          (slot, index) => {
            const start =
              index * SLICE_ANGLE;

            const end =
              start + SLICE_ANGLE;

            return ${slot.color} ${start}deg ${end}deg;
          }
        );

      return `conic-gradient(from 0deg, ${colorParts.join(
        ", "
      )})`;
    }, [slots]);

  const spinWheel = () => {
    if (
      spinning ||
      alreadySpun ||
      !wheelIsReady
    ) {
      return;
    }

    setSpinning(true);
    setResult("");
    setResultProduct("");

    /*
      Choix aléatoire entre les 8 parties.
    */
    const winningIndex =
      Math.floor(
        Math.random() *
          WHEEL_PARTS
      );

    const winningPrize =
      slots[winningIndex];

    /*
      Centre de la partie gagnante.
    */
    const targetCenterAngle =
      winningIndex *
        SLICE_ANGLE +
      SLICE_ANGLE / 2;

    /*
      La flèche est placée en haut.
      On tourne donc la roue afin que
      le centre de la partie gagnante
      arrive sous la flèche.
    */
    const desiredRotation =
      (360 -
        targetCenterAngle) %
      360;

    const currentNormalized =
      ((rotation % 360) + 360) %
      360;

    const correction =
      (
        desiredRotation -
        currentNormalized +
        360
      ) % 360;

    /*
      Entre 6 et 8 tours complets.
    */
    const completeTurns =
      6 +
      Math.floor(
        Math.random() * 3
      );

    const newRotation =
      rotation +
      completeTurns * 360 +
      correction;

    /*
      On enregistre immédiatement
      la participation du mois.
    */
    markSpinForCurrentMonth();

    setAlreadySpun(true);
    setRotation(newRotation);

    window.setTimeout(() => {
      const reward =
        createWheelReward({
          id: winningPrize.id,
          label:
            winningPrize.label,
          percentage:
            winningPrize.percentage,
          productName:
            winningPrize.productName,
        });

      setResult(reward.label);

      setResultProduct(
        reward.productName || ""
      );

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
            Tourne la roue et gagne
            une réduction sur l’un de
            nos produits. Une seule
            participation est autorisée
            par mois.
          </p>
        </div>

        {!wheelIsReady && (
          <div className="mx-auto mb-8 max-w-xl rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
            <p className="font-bold text-orange-500">
              Configuration incomplète
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              La roue doit contenir
              exactement 8 récompenses
              actives.
            </p>

            <p className="mt-2 text-sm font-semibold">
              {configuredSlotsCount}/8
              récompenses configurées
            </p>
          </div>
        )}

        <div className="relative mx-auto mb-10 flex h-[330px] w-[330px] items-center justify-center sm:h-[390px] sm:w-[390px] md:h-[470px] md:w-[470px]">
          {/* Flèche supérieure */}
          <div className="absolute -top-4 z-40 flex flex-col items-center">
            <div className="h-7 w-7 rounded-full border-4 border-background bg-primary shadow-xl" />

            <div className="-mt-1 h-0 w-0 border-l-[22px] border-r-[22px] border-t-[44px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
          </div>

          {/* Lumière derrière la roue */}
          <div className="absolute h-full w-full rounded-full bg-primary/20 blur-2xl" />

          {/* La roue */}
          <div
            className="relative h-full w-full overflow-hidden rounded-full border-[10px] border-primary shadow-2xl"
            style={{
              transform: rotate(${rotation}deg),

              transition: spinning
                ? transform ${SPIN_DURATION}ms cubic-bezier(0.12, 0.72, 0.18, 1)
                : "none",

              background:
                wheelBackground,
            }}
          >
            {/* Cercles décoratifs */}
            <div className="pointer-events-none absolute inset-3 rounded-full border-4 border-white/25" />

            <div className="pointer-events-none absolute inset-12 rounded-full border border-white/15" />

            {/* Lignes de séparation */}
            {slots.map(
              (slot, index) => {
                const lineAngle =
                  index *
                  SLICE_ANGLE;

                return (
                  <div
                    key={`separator-${slot.id}-${index}`}
                    className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-1/2 w-[3px] origin-bottom bg-white/70 shadow-sm"
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

            {/* Contenu des 8 parties */}
            {slots.map(
              (slot, index) => {
                const angle =
                  index *
                    SLICE_ANGLE +
                  SLICE_ANGLE / 2;

                return (
                  <div
                    key={slot.id}
                    className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex w-[100px] flex-col items-center justify-center text-center text-white sm:w-[115px] md:w-[130px]"
                    style={{
                      transform: `
                        translate(-50%, -50%)
                        rotate(${angle}deg)
                        translateY(clamp(-185px, -37vw, -125px))
                        rotate(-${angle}deg)
                      `,
                    }}
                  >
                    <div className="max-w-full rounded-lg bg-black/25 px-2 py-1.5 shadow-lg backdrop-blur-[2px]">
                      <p className="line-clamp-2 text-[9px] font-black uppercase leading-tight sm:text-[10px] md:text-xs">
                        {slot.productName}
                      </p>

                      <p className="mt-1 line-clamp-2 text-[8px] font-semibold leading-tight text-white/90 sm:text-[9px] md:text-[10px]">
                        {slot.label}
                      </p>
                    </div>
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
              !wheelIsReady
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
                    : !wheelIsReady
                      ? "8 PRIX"
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
            !wheelIsReady
          }
          className="gradient-primary glow-primary h-12 border-0 px-10 text-primary-foreground"
        >
          {spinning
            ? "La roue tourne..."
            : alreadySpun
              ? "Participation déjà utilisée"
              : !wheelIsReady
                ? Configurer les 8 récompenses (${configuredSlotsCount}/8)
                : "Tourner la roue"}
        </Button>

        {alreadySpun &&
          !spinning && (
            <div className="mx-auto mt-5 flex max-w-md items-center justify-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="h-4 w-4" />

              Tu pourras rejouer le
              mois prochain.
            </div>
          )}

        {result &&
          !spinning && (
            <div className="mx-auto mt-8 max-w-md rounded-3xl border bg-card p-6 shadow-card">
              <Trophy className="mx-auto mb-3 h-10 w-10 text-primary" />

              <h2 className="text-3xl font-bold">
                Bravo 🎁
              </h2>

              {resultProduct && (
                <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {resultProduct}
                </p>
              )}

              <p className="gradient-text mt-2 text-xl font-bold">
                {result}
              </p>

              <p className="mt-3 text-sm text-muted-foreground">
                Ton offre est disponible
                dans la page des produits.
                Elle sera utilisée une
                seule fois.
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
