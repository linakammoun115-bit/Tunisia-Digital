import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Gift, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/wheel")({
  component: AdminWheelPage,
});

function AdminWheelPage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              🎡 Gestion de la roue
            </h1>

            <p className="mt-2 text-muted-foreground">
              Gérez les produits, les cadeaux et les probabilités de la roue.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link to="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border bg-card p-6 shadow">
            <p className="text-muted-foreground">
              Récompenses actives
            </p>

            <h2 className="mt-3 text-4xl font-bold text-primary">
              0 / 8
            </h2>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow">
            <p className="text-muted-foreground">
              Total des probabilités
            </p>

            <h2 className="mt-3 text-4xl font-bold text-primary">
              0 %
            </h2>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow">
            <p className="text-muted-foreground">
              Etat
            </p>

            <h2 className="mt-3 text-2xl font-bold text-red-500">
              Non configurée
            </h2>
          </div>

        </div>

        {/* Bouton Ajouter */}
        <div className="mt-10">
          <Button className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une récompense
          </Button>
        </div>

        {/* Tableau */}
        <div className="mt-8 overflow-hidden rounded-2xl border">

          <table className="w-full">

            <thead className="bg-muted">
              <tr>
                <th className="p-4 text-left">
                  Produit
                </th>

                <th className="p-4 text-left">
                  Cadeau
                </th>

                <th className="p-4 text-left">
                  %
                </th>

                <th className="p-4 text-left">
                  Couleur
                </th>

                <th className="p-4 text-left">
                  Active
                </th>

                <th className="p-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>

              <tr>
                <td
                  colSpan={6}
                  className="p-12 text-center text-muted-foreground"
                >
                  <Gift className="mx-auto mb-4 h-10 w-10" />

                  Aucune récompense configurée.
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>
    </main>
  );
}
