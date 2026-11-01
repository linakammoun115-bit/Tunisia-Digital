
import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useCallback,
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
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

import {
  addWheelPrize,
  deleteWheelPrize,
  getWheelPrizes,
  subscribeToWheelPrizes,
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Une erreur est survenue.";
}

function AdminWheelPage() {
  const [prizes, setPrizes] = useState<WheelPrize[]>([]);
  const [form, setForm] = useState<PrizeForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeCount = useMemo(
    () => prizes.filter((prize) => prize.active).length,
    [prizes]
  );

  const loadPrizes = useCallback(async () => {
    try {
      const data = await getWheelPrizes();
      setPrizes(data);
      setMessage("");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPrizes();

    const unsubscribe = subscribeToWheelPrizes(() => {
      void loadPrizes();
    });

    return () => {
      unsubscribe();
    };
  }, [loadPrizes]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function startEditing(prize: WheelPrize) {
    setEditingId(prize.id);
    setForm({
      name: prize.name,
      label: prize.label,
      percentage: String(prize.percentage),
      productName: prize.productName || "",
      color: prize.color,
      active: prize.active,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const percentage = Number(form.percentage);

    if (!form.name.trim() || !form.label.trim()) {
      setMessage("Veuillez remplir le nom et le libellé.");
      return;
    }

    if (
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      setMessage("La probabilité doit être comprise entre 0 et 100.");
      return;
    }

    if (
      form.active &&
      !editingId &&
      activeCount >= MAX_ACTIVE_PRIZES
    ) {
      setMessage("La roue ne peut pas contenir plus de 8 lots actifs.");
      return;
    }

    if (
      form.active &&
      editingId &&
      !prizes.find((prize) => prize.id === editingId)?.active &&
      activeCount >= MAX_ACTIVE_PRIZES
    ) {
      setMessage("La roue ne peut pas contenir plus de 8 lots actifs.");
      return;
    }

    const prizeData = {
      name: form.name.trim(),
      label: form.label.trim(),
      percentage,
      productName: form.productName.trim(),
      color: form.color,
      active: form.active,
    };

    setSaving(true);

    try {
      if (editingId) {
        await updateWheelPrize(editingId, prizeData);
        setMessage("Récompense modifiée avec succès.");
      } else {
        await addWheelPrize(prizeData);
        setMessage("Récompense ajoutée avec succès.");
      }

      resetForm();
      await loadPrizes();
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Voulez-vous vraiment supprimer cette récompense ?")) {
      return;
    }

    setMessage("");
    setSaving(true);

    try {
      await deleteWheelPrize(id);
      setMessage("Récompense supprimée avec succès.");
      await loadPrizes();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(prize: WheelPrize) {
    if (!prize.active && activeCount >= MAX_ACTIVE_PRIZES) {
      setMessage("Maximum 8 récompenses actives.");
      return;
    }

    setMessage("");

    try {
      await updateWheelPrize(prize.id, {
        active: !prize.active,
      });
      await loadPrizes();
    } catch (error) {
      setMessage(getErrorMessage(error));
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Chargement des récompenses...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'administration
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-3 text-purple-700">
            <Gift className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Gestion de la roue
            </h1>
            <p className="text-sm text-muted-foreground">
              Gérez les cadeaux et les réductions.
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border p-3 text-sm">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>{message}</span>
            <button
              type="button"
              className="ml-auto"
              onClick={() => setMessage("")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Total des récompenses
            </p>
            <p className="mt-1 text-2xl font-bold">
              {prizes.length}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Récompenses actives
            </p>
            <p className="mt-1 text-2xl font-bold">
              {activeCount}/{MAX_ACTIVE_PRIZES}
            </p>
          </div>
        </div>

        <section className="mb-8 rounded-xl border bg-card p-5">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
            {editingId ? (
              <>
                <Edit3 className="h-5 w-5" />
                Modifier une récompense
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Ajouter une récompense
              </>
            )}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Nom de la récompense
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Ex : Réduction 10 %"
                  className="w-full rounded-lg border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Texte affiché sur la roue
                </label>
                <input
                  required
                  value={form.label}
                  onChange={(e) =>
                    setForm({ ...form, label: e.target.value })
                  }
                  placeholder="Ex : 10 % de réduction"
                  className="w-full rounded-lg border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Probabilité (%)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.percentage}
                  onChange={(e) =>
                    setForm({ ...form, percentage: e.target.value })
                  }
                  placeholder="Ex : 20"
                  className="w-full rounded-lg border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Produit concerné (facultatif)
                </label>
                <input
                  value={form.productName}
                  onChange={(e) =>
                    setForm({ ...form, productName: e.target.value })
                  }
                  placeholder="Nom du produit"
                  className="w-full rounded-lg border bg-background px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Couleur
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="h-10 w-16 cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    {form.color}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  id="prize-active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <label htmlFor="prize-active" className="text-sm font-medium">
                  Récompense active
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {editingId ? "Enregistrer les modifications" : "Ajouter"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="mb-5 text-lg font-semibold">
            Liste des récompenses
          </h2>

          {prizes.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Aucune récompense trouvée.
            </p>
          ) : (
            <div className="space-y-3">
              {prizes.map((prize) => (
                <div
                  key={prize.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 md:flex-row md:items-center"
                >
                  <div
                    className="h-12 w-12 shrink-0 rounded-lg border"
                    style={{ backgroundColor: prize.color }}
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{prize.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {prize.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Probabilité : {prize.percentage} %
                      {prize.productName
                        ? ` • Produit : ${prize.productName}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                        prize.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {prize.active ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {prize.active ? "Active" : "Inactive"}
                    </span>

                    <button
                      type="button"
                      onClick={() => void toggleActive(prize)}
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                    >
                      {prize.active ? "Désactiver" : "Activer"}
                    </button>

                    <button
                      type="button"
                      onClick={() => startEditing(prize)}
                      className="rounded-lg border p-2 hover:bg-muted"
                      title="Modifier"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(prize.id)}
                      disabled={saving}
                      className="rounded-lg border p-2 text-red-600 hover:bg-red-50"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
