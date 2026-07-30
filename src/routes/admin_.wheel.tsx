import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Gift,
  Plus,
  Save,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  addWheelPrize,
  deleteWheelPrize,
  getWheelPrizes,
  saveWheelPrizes,
  updateWheelPrize,
  type WheelPrize,
} from "@/lib/wheelConfig";

export const Route = createFileRoute("/admin_/wheel")({
  component: AdminWheelPage,
});

const MAX_ACTIVE_PRIZES = 8;

const DEFAULT_COLORS = [
  "#7c3aed",
  "#db2777",
  "#2563eb",
  "#0891b2",
  "#16a34a",
  "#ca8a04",
  "#ea580c",
  "#dc2626",
];

type PrizeForm = {
  name: string;
  label: string;
  percentage: string;
  productName: string;
  color: string;
  active: boolean;
};

const EMPTY_FORM: PrizeForm = {
  name: "",
  label: "",
  percentage: "",
  productName: "",
  color: DEFAULT_COLORS[0],
  active: true,
};

function AdminWheelPage() {
  const [prizes, setPrizes] =
    useState<WheelPrize[]>([]);

  const [form, setForm] =
    useState<PrizeForm>(EMPTY_FORM);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadPrizes();
  }, []);

  function loadPrizes() {
    setPrizes(getWheelPrizes());
  }

  const activePrizes = useMemo(
    () =>
      prizes.filter(
        (prize) => prize.active
      ),
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
    activeCount === MAX_ACTIVE_PRIZES &&
    totalPercentage === 100;

  function updateForm<
    Key extends keyof PrizeForm
  >(
    key: Key,
    value: PrizeForm[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function showMessage(
    text: string
  ) {
    setMessage(text);

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const percentage =
      Number(form.percentage);

    if (!form.name.trim()) {
      showMessage(
        "Ajoutez le nom de la récompense."
      );
      return;
    }

    if (!form.label.trim()) {
      showMessage(
        "Ajoutez le texte affiché dans la roue."
      );
      return;
    }

    if (
      Number.isNaN(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      showMessage(
        "Le pourcentage doit être compris entre 0 et 100."
      );
      return;
    }

    const editedPrize =
      editingId
        ? prizes.find(
            (prize) =>
              prize.id === editingId
          )
        : undefined;

    const activatingNewPrize =
      form.active &&
      (!editedPrize ||
        !editedPrize.active);

    if (
      activatingNewPrize &&
      activeCount >= MAX_ACTIVE_PRIZES
    ) {
      showMessage(
        "La roue contient déjà 8 récompenses actives."
      );
      return;
    }

    const prizeData = {
      name: form.name.trim(),
      label: form.label.trim(),
      percentage,
      productName:
        form.productName.trim() ||
        undefined,
      color:
        form.color.trim() ||
        DEFAULT_COLORS[0],
      active: form.active,
    };

    if (editingId) {
      updateWheelPrize(
        editingId,
        prizeData
      );

      showMessage(
        "Récompense modifiée."
      );
    } else {
      addWheelPrize(prizeData);

      showMessage(
        "Récompense ajoutée."
      );
    }

    resetForm();
    loadPrizes();
  }

  function handleEdit(
    prize: WheelPrize
  ) {
    setEditingId(prize.id);

    setForm({
      name: prize.name,
      label: prize.label,
      percentage:
        prize.percentage.toString(),
      productName:
        prize.productName || "",
      color: prize.color,
      active: prize.active,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleDelete(
    prize: WheelPrize
  ) {
    const confirmed =
      window.confirm(
        Supprimer "${prize.name}" ?
      );

    if (!confirmed) {
      return;
    }

    deleteWheelPrize(prize.id);

    if (editingId === prize.id) {
      resetForm();
    }

    loadPrizes();

    showMessage(
      "Récompense supprimée."
    );
  }

  function handleToggleActive(
    prize: WheelPrize
  ) {
    if (
      !prize.active &&
      activeCount >= MAX_ACTIVE_PRIZES
    ) {
      showMessage(
        "Vous avez déjà 8 récompenses actives."
      );
      return;
    }

    updateWheelPrize(prize.id, {
      active: !prize.active,
    });

    loadPrizes();
  }

  function handleSaveOrder() {
    saveWheelPrizes(prizes);

    showMessage(
      "Configuration enregistrée."
    );
  }

  function movePrize(
    index: number,
    direction: -1 | 1
  ) {
    const targetIndex =
      index + direction;

    if (
      targetIndex < 0 ||
      targetIndex >= prizes.length
    ) {
      return;
    }

    const updated = [...prizes];

    [
      updated[index],
      updated[targetIndex],
    ] = [
      updated[targetIndex],
      updated[index],
    ];

    setPrizes(updated);
    saveWheelPrizes(updated);
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard
            </Link>

            <h1 className="text-3xl font-bold sm:text-4xl">
              Gestion de la roue
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Configurez exactement 8
              récompenses actives avec un
              total de 100 %.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleSaveOrder}
            variant="outline"
          >
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
        </header>

        {message && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
            {message}
          </div>
        )}

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Récompenses actives
            </p>

            <p
              className={`mt-3 text-4xl font-bold ${
                activeCount ===
                MAX_ACTIVE_PRIZES
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {activeCount} / 8
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Total des remises
            </p>

            <p
              className={`mt-3 text-4xl font-bold ${
                totalPercentage === 100
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {totalPercentage} %
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <p className="text-sm text-muted-foreground">
              État de la roue
            </p>

            <div className="mt-3 flex items-center gap-2">
              {wheelIsValid ? (
                <>
                  <CheckCircle2 className="h-7 w-7 text-green-500" />

                  <p className="text-xl font-bold text-green-500">
                    Prête
                  </p>
                </>
              ) : (
                <>
                  <XCircle className="h-7 w-7 text-red-500" />

                  <p className="text-xl font-bold text-red-500">
                    Incorrecte
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {!wheelIsValid && (
          <section className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <h2 className="font-bold text-red-500">
              Configuration incomplète
            </h2>

            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              {activeCount !==
                MAX_ACTIVE_PRIZES && (
                <p>
                  Il faut exactement 8
                  récompenses actives.
                </p>
              )}

              {totalPercentage !== 100 && (
                <p>
                  Le total des pourcentages
                  des récompenses actives
                  doit être égal à 100 %.
                </p>
              )}
            </div>
          </section>
        )}

        <section className="mb-8 rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {editingId
                  ? "Modifier la récompense"
                  : "Ajouter une récompense"}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Choisissez le produit, le
                texte, le pourcentage et la
                couleur de chaque partie.
              </p>
            </div>

            {editingId && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={resetForm}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-5 md:grid-cols-2"
          >
            <label className="space-y-2">
              <span className="text-sm font-semibold">
                Nom de la récompense
              </span>

              <input
                value={form.name}
                onChange={(event) =>
                  updateForm(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Ex: Gemini Pro"
                className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">
                Produit concerné
              </span>

              <input
                value={form.productName}
                onChange={(event) =>
                  updateForm(
                    "productName",
                    event.target.value
                  )
                }
                placeholder="Ex: Spotify Premium"
                className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold">
                Texte affiché dans la roue
              </span>

              <input
                value={form.label}
                onChange={(event) =>
                  updateForm(
                    "label",
                    event.target.value
                  )
                }
                placeholder="Ex: Spotify Premium -10%"
                className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">
                Pourcentage
              </span>

              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.percentage}
                onChange={(event) =>
                  updateForm(
                    "percentage",
                    event.target.value
                  )
                }
                placeholder="Ex: 10"
                className="h-11 w-full rounded-xl border bg-background px-4 outline-none transition focus:border-primary"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold">
                Couleur
              </span>

              <div className="flex h-11 items-center gap-3 rounded-xl border bg-background px-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(event) =>
                    updateForm(
                      "color",
                      event.target.value
                    )
                  }
                  className="h-8 w-12 cursor-pointer border-0 bg-transparent"
                />

                <input
                  value={form.color}
                  onChange={(event) =>
                    updateForm(
                      "color",
                      event.target.value
                    )
                  }
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </label>

            <div className="md:col-span-2">
              <p className="mb-3 text-sm font-semibold">
                Couleurs rapides
              </p>

              <div className="flex flex-wrap gap-3">
                {DEFAULT_COLORS.map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Choisir ${color}`}
                      onClick={() =>
                        updateForm(
                          "color",
                          color
                        )
                      }
                      className={`h-10 w-10 rounded-full border-4 transition hover:scale-110 ${
                        form.color === color
                          ? "border-primary"
                          : "border-white/20"
                      }`}
                      style={{
                        backgroundColor:
                          color,
                      }}
                    />
                  )
                )}
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background p-4 md:col-span-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) =>
                  updateForm(
                    "active",
                    event.target.checked
                  )
                }
                className="h-5 w-5 accent-primary"
              />

              <div>
                <p className="font-semibold">
                  Récompense active
                </p>

                <p className="text-xs text-muted-foreground">
                  Elle apparaîtra dans une
                  partie de la roue.
                </p>
              </div>
            </label>

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <Button
                type="submit"
                className="gradient-primary border-0"
              >
                {editingId ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer les modifications
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter la récompense
                  </>
                )}
              </Button>

              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </section>

        <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div className="border-b p-5 sm:p-7">
            <h2 className="text-2xl font-bold">
              Récompenses configurées
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Les 8 récompenses actives
              seront affichées dans la roue
              selon cet ordre.
            </p>
          </div>

          {prizes.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Gift className="mx-auto mb-4 h-10 w-10" />
              Aucune récompense configurée.
            </div>
          ) : (
            <div className="divide-y">
              {prizes.map(
                (prize, index) => (
                  <article
                    key={prize.id}
                    className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[60px_1fr_auto] lg:items-center"
                  >
                    <div
                      className="h-14 w-14 rounded-2xl border-4 border-white/20 shadow"
                      style={{
                        backgroundColor:
                          prize.color,
                      }}
                    />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-bold">
                          {prize.name}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            prize.active
                              ? "bg-green-500/15 text-green-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {prize.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {prize.label}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <span>
                          Produit:{" "}
                          <strong>
                            {prize.productName ||
                              "Tous les produits"}
                          </strong>
                        </span>

                        <span>
                          Pourcentage:{" "}
                          <strong>
                            {prize.percentage} %
                          </strong>
                        </span>

                        <span className="font-mono">
                          {prize.color}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={index === 0}
                        onClick={() =>
                          movePrize(
                            index,
                            -1
                          )
                        }
                      >
                        ↑
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={
                          index ===
                          prizes.length - 1
                        }
                        onClick={() =>
                          movePrize(
                            index,
                            1
                          )
                        }
                      >
                        ↓
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleToggleActive(
                            prize
                          )
                        }
                      >
                        {prize.active
                          ? "Désactiver"
                          : "Activer"}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleEdit(prize)
                        }
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() =>
                          handleDelete(prize)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
