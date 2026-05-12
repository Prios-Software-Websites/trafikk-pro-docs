import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatCard } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getStudent, packages } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/foresatt/okonomi")({
  component: () => <RoleGate allow={["parent"]}><Econ /></RoleGate>,
});

function Econ() {
  const { t } = useI18n();
  const s = getStudent("s-001")!;
  return (
    <>
      <PageHeader title={t("nav_economy")} description={`Saldo og betaling for ${s.name}.`} />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Saldo" value={`${s.balanceNok} kr`} tone={s.balanceNok < 0 ? "destructive" : "success"} />
        <StatCard label="Brukte timer" value={s.lessons} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((p) => (
          <Card key={p.id} className="p-5 flex items-center justify-between">
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.lessons} timer · {p.price.toLocaleString("nb-NO")} kr</div>
            </div>
            <Button onClick={() => toast.success(`Mock-betaling for ${s.name}`)}>Betal</Button>
          </Card>
        ))}
      </div>
    </>
  );
}
