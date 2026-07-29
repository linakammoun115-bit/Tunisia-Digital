import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/wheel")({
  component: AdminWheelPage,
});

function AdminWheelPage() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Gestion de la roue
        </h1>
      </div>
    </main>
  );
}
