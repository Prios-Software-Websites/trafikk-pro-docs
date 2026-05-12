import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { practice } from "@/lib/mock-data";

export const Route = createFileRoute("/foresatt/ovingskjoring")({
  component: () => <RoleGate allow={["parent"]}><P /></RoleGate>,
});

function P() {
  const { t } = useI18n();
  const list = practice.filter((p) => p.studentId === "s-001");
  return (
    <>
      <PageHeader title={t("nav_practice")} description="Privat øvingskjøring logget av eleven." />
      <Card className="p-0 overflow-hidden">
        <ul className="divide-y divide-border">
          {list.map((p) => (
            <li key={p.id} className="px-5 py-3">
              <div className="flex justify-between"><div className="font-medium">{p.route}</div><span className="text-xs text-muted-foreground">{p.date}</span></div>
              <div className="text-xs text-muted-foreground mt-1">{p.startTime}–{p.endTime} · {p.km} km · m/ {p.accompanying}</div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
