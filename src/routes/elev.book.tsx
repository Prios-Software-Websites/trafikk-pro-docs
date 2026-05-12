import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatusBadge } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/elev/book")({
  component: () => <RoleGate allow={["student"]}><Book /></RoleGate>,
});

const slots = [
  { id: "b1", date: "2026-05-14", time: "09:00", teacher: "Erik Stenberg", type: "Ordinær", available: true },
  { id: "b2", date: "2026-05-14", time: "10:30", teacher: "Erik Stenberg", type: "Ordinær", available: true },
  { id: "b3", date: "2026-05-15", time: "14:00", teacher: "Siri Nilsen", type: "Veiledningstime", available: true },
  { id: "b4", date: "2026-05-16", time: "11:00", teacher: "Hanne Kristiansen", type: "Sikkerhetskurs bane", available: false, reason: "Trinn 4 låst — fullfør trinn 3" },
];

function Book() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t("nav_book")} description="Avbestillingsfrist: 48 timer. Ved senere avbestilling påløper gebyr." />
      <div className="space-y-3">
        {slots.map((s) => (
          <Card key={s.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="font-semibold">{s.date} · {s.time}</div>
              <div className="text-xs text-muted-foreground">{s.type} · {s.teacher}</div>
            </div>
            {s.available ? (
              <Button onClick={() => toast.success("Time booket", { description: `${s.date} ${s.time}` })}>Book</Button>
            ) : (
              <div className="flex items-center gap-2">
                <StatusBadge tone="destructive">Låst</StatusBadge>
                <span className="text-xs text-muted-foreground">{s.reason}</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
