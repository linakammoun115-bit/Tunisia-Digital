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

import { Button } from "@/components/ui/button";

import {
  addWheelPrize,
  deleteWheelPrize,
  getWheelPrizes,
  saveWheelPrizes,
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
  const [prizes, setPrizes] =
    useState<WheelPrize[]>([]);

  const [form, setForm] =
    useState<PrizeForm>(EMPTY_FORM);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);
    return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <Gift className="h-7 w-7" />
          <h1 className="text-2xl font-bold">
            Gestion de la roue
          </h1>
        </div>

        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Chargement...
          </div>
        ) : (
          <p>Gestion des cadeaux et des réductions.</p>
        )}
      </div>
    </div>
  );
}
