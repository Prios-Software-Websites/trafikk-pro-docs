import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatusBadge } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { lessons, getStudent, getTeacher } from "@/lib/mock-data";

export const Route = createFileRoute("/larer/kalender")({
  component: () => <RoleGate allow={["teacher"]}><Cal /></RoleGate>,
});

function Cal() {
  const { t } = useI18n();
  const days = Array.from(new Set(lessons.map((l) => l.date))).sort();
  return (
    <>
      <PageHeader title={t("nav_calendar")} />
      <div className="space-y-4">
        {days.map((day) => (
          <Card key={day} className="p-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-border font-semibold text-sm bg-muted/30">
              {new Date(day).toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })}
            </div>
            <ul className="divide-y divide-border">
              {lessons.filter((l) => l.date === day).map((l) => {
                const s = getStudent(l.studentId);
                const tch = getTeacher(l.teacherId);
                return (
                  <li key={l.id} className="px-5 py-3 flex items-center gap-4 flex-wrap">
                    <div className="font-mono text-sm w-16">{l.start}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{s?.name} · Trinn {l.trinn}</div>
                      <div className="text-xs text-muted-foreground">{l.type} · {l.durationMin} min · {tch?.name}</div>
                    </div>
                    {l.attested ? <StatusBadge tone="success">Attestert</StatusBadge> : <StatusBadge tone="warning">Venter</StatusBadge>}
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
