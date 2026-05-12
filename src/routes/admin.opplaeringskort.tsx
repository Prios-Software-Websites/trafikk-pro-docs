import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatusBadge } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { students, getTeacher } from "@/lib/mock-data";
import { TrainingCard } from "@/components/TrainingCard";
import { Eye } from "lucide-react";

export const Route = createFileRoute("/admin/opplaeringskort")({
  head: () => ({ meta: [{ title: "Opplæringskort — TrafikkDok. Pro" }] }),
  component: () => <RoleGate allow={["admin"]}><Cards /></RoleGate>,
});

function Cards() {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title={t("nav_training_card")} description="Oversikt over alle aktive elevers digitale opplæringskort." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {students.filter((s) => s.status === "Aktiv").map((s) => (
          <Card key={s.id} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.studentNo} · {t("class")} {s.licenseClass} · {getTeacher(s.responsibleTeacherId)?.name}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate({ to: "/admin/opplaeringskort/$id", params: { id: s.id } })}>
                <Eye className="size-4" /> {t("view")}
              </Button>
            </div>
            <TrainingCard student={s} compact />
          </Card>
        ))}
      </div>
    </>
  );
}
