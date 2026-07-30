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

const WHEEL_SEGMENTS = 8;
const SLICE_ANGLE = 360 / WHEEL_SEGMENTS;
const SPIN_DURATION = 5000;

const FALLBACK_COLORS = [
  "#7c3aed",
  "#db2777",
  "#2563eb",
  "#0891b2",
  "#16a34a",
  "#ca8a04",
  "#ea580c",
  "#dc2626",
];

type WheelSegment = {
  id: string;
  name: string;
  label: string;
  percentage: number;
  productName: string;
  color: string;
};

function WheelGame() {
  const [prizes, setPrizes] =
    useState<WheelPrize[]>([]);

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

  useEffect(() => {
    function loadWheelPrizes() {
      const activePrizes =
        getActiveWheelPrizes();

      setPrizes(activePrizes);
    }

    loadWheelPrizes();

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
      loadWheelPrizes
    );

    window.addEventListener(
      "storage",
      loadWheelPrizes
    );

    return () => {
      window.removeEventListener(
        "wheel-config-updated",
        loadWheelPrizes
      );

      window.removeEventListener(
        "storage",
        loadWheelPrizes
      );
    };
  }, []);

  const activePrizes = useMemo(
    () =>
      prizes
        .filter(
          (prize) => prize.active
        )
        .slice(0, WHEEL_SEGMENTS),
    [prizes]
  );

  const activeCount =
    activePrizes.length;

  const totalPercentage =
    activePrizes.reduce(
      (total, prize) =>
        total + prize.percentage,
      0
    );

  const wheelIsValid =
    activeCount === WHEEL_SEGMENTS &&
    totalPercentage === 100;

  const segments =
    useMemo<WheelSegment[]>(() => {
      return Array.from(
        {
          length: WHEEL_SEGMENTS,
        },
        (_, index) => {
          const prize =
            activePrizes[index];

          if (prize) {
            return {
              id: prize.id,
              name: prize.name,
              label: prize.label,
              percentage:
                prize.percentage,
              productName:
                prize.productName ||
                prize.name,
              color:
                prize.color ||
                FALLBACK_COLORS[index],
            };
          }

          return {
            id: "empty-" + index,
            name:
              "Produit " +
              (index + 1),
            label: "À configurer",
            percentage: 0,
            productName:
              "Produit " +
              (index + 1),
            color:
              FALLBACK_COLORS[index],
          };
        }
      );
    }, [activePrizes]);

  const wheelBackground =
    useMemo(() => {
      const parts =
        segments.map(
          (segment, index) => {
            const start =
              index * SLICE_ANGLE;

            const end =
              start + SLICE_ANGLE;

            return (
              segment.color +
              " " +
              start +
              "deg " +
              end +
              "deg"
            );
          }
        );

      return (
        "conic-gradient(from 0deg, " +
        parts.join(", ") +
        ")"
      );
    }, [segments]);

  function spinWheel() {
    if (
      spinning ||
      alreadySpun ||
      !wheelIsValid
    ) {
      return;
    }

    setSpinning(true);
    setResult("");
    setResultProduct("");

    const winningIndex =
      Math.floor(
        Math.random() *
          WHEEL_SEGMENTS
      );

    const winningPrize =
      segments[winningIndex];

    const targetCenterAngle =
      winningIndex *
        SLICE_ANGLE +
      SLICE_ANGLE / 2;

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

    const completeTurns =
      6 +
      Math.floor(
        Math.random() * 3
      );

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
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-14 text-foreground sm:px-6 md:py-20">
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

        <section className="mb-10">
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
        </section>

        {!wheelIsValid && (
          <section className="mx-auto mb-10 max-w-2xl rounded-3xl border border-red-500/40 bg-red-500/10 p-6 shadow-xl sm:p-8">
            <TriangleAlert className="mx-auto h-12 w-12 text-red-500" />

            <h2 className="mt-4 text-2xl font-bold text-red-500 sm:text-3xl">
              Configuration incorrecte
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              Corrige la configuration
              depuis la page Admin avant
              d’utiliser la roue.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border bg-background/60 p-5">
                <p className="text-sm text-muted-foreground">
                  Récompenses actives
                </p>

                <p className="mt-2 text-3xl font-bold text-red-500">
                  {activeCount} / 8
                </p>
              </div>

              <div className="rounded-2xl border bg-background/60 p-5">
                <p className="text-sm text-muted-foreground">
                  Total des remises
                </p>

                <p className="mt-2 text-3xl font-bold text-red-500">
                  {totalPercentage} %
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2 text-sm font-semibold text-red-500 sm:text-base">
              {activeCount !==
                WHEEL_SEGMENTS && (
                <p>
                  Il faut exactement huit
                  récompenses actives.
                </p>
              )}

              {totalPercentage !== 100 && (
                <p>
                  Le total des
                  pourcentages saisis dans
                  l’Admin doit être égal à
                  100 %.
                </p>
              )}
            </div>
          </section>
        )}

        <section className="relative mx-auto mb-10 flex h-[330px] w-[330px] items-center justify-center sm:h-[390px] sm:w-[390px] md:h-[470px] md:w-[470px]">
          <div className="absolute -top-4 z-40 flex flex-col items-center">
            <div className="h-7 w-7 rounded-full border-4 border-background bg-primary shadow-xl" />

            <div className="-mt-1 h-0 w-0 border-l-[22px] border-r-[22px] border-t-[44px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
          </div>

          <div className="absolute h-full w-full rounded-full bg-primary/20 blur-2xl" />

          <div
            className="relative h-full w-full overflow-hidden rounded-full border-[10px] border-primary shadow-2xl"
            style={{
              transform:
                "rotate(" +
                rotation +
                "deg)",

              transition: spinning
                ? "transform " +
                  SPIN_DURATION +
                  "ms cubic-bezier(0.12, 0.72, 0.18, 1)"
                : "none",

              background:
                wheelBackground,
            }}
          >
            <div className="pointer-events-none absolute inset-3 rounded-full border-4 border-white/25" />

            <div className="pointer-events-none absolute inset-12 rounded-full border border-white/15" />

            {segments.map(
              (segment, index) => {
                const angle =
                  index *
                  SLICE_ANGLE;

                return (
                  <div
                    key={
                      "line-" +
                      segment.id +
                      "-" +
                      index
                    }
                    className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-1/2 w-[3px] origin-bottom bg-white/70"
                    style={{
                      transform:
                        "translateX(-50%) " +
                        "translateY(-100%) " +
                        "rotate(" +
                        angle +
                        "deg)",
                    }}
                  />
                );
              }
            )}

            {segments.map(
              (segment, index) => {
                const angle =
                  index *
                    SLICE_ANGLE +
                  SLICE_ANGLE / 2;

                return (
                  <div
                    key={segment.id}
                    className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex w-[96px] flex-col items-center justify-center text-center text-white sm:w-[112px] md:w-[125px]"
                    style={{
                      transform:
                        "translate(-50%, -50%) " +
                        "rotate(" +
                        angle +
                        "deg) " +
                        "translateY(clamp(-185px, -37vw, -125px)) " +
                        "rotate(-" +
                        angle +
                        "deg)",
                    }}
                  >
                    <div className="max-w-full rounded-lg bg-black/25 px-2 py-1.5 shadow-lg backdrop-blur-[2px]">
                      <p className="line-clamp-2 text-[9px] font-black uppercase leading-tight sm:text-[10px] md:text-xs">
                        {
                          segment.productName
                        }
                      </p>

                      <p className="mt-1 line-clamp-2 text-[8px] font-semibold leading-tight text-white/90 sm:text-[9px] md:text-[10px]">
                        {segment.label}
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <button
            type="button"
            onClick={spinWheel}
            disabled={
              spinning ||
              alreadySpun ||
              !wheelIsValid
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
                    : !wheelIsValid
                      ? "BLOQUÉ"
                      : "SPIN"}
              </p>
            </div>
          </button>
        </section>

        <Button
          type="button"
          onClick={spinWheel}
          disabled={
            spinning ||
            alreadySpun ||
            !wheelIsValid
          }
          className="gradient-primary glow-primary h-12 border-0 px-10 text-primary-foreground"
        >
          {spinning
            ? "La roue tourne..."
            : alreadySpun
              ? "Participation déjà utilisée"
              : !wheelIsValid
                ? "Configuration requise"
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
            <section className="mx-auto mt-8 max-w-md rounded-3xl border bg-card p-6 shadow-card">
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
            </section>
          )}
      </div>
    </main>
  );
}
