import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatCard } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getStudent, packages } from "@/lib/mock-data";
import { useNotifications } from "@/lib/notifications";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";

export const Route = createFileRoute("/elev/betaling")({
  component: () => <RoleGate allow={["student", "parent"]}><Pay /></RoleGate>,
});

function Pay() {
  const { t } = useI18n();
  const s = getStudent("s-001")!;
  const { user } = useAuth();
  const { create } = useNotifications();
  const pay = (p: typeof packages[number], method: string) => {
    create({ recipientId: user!.id, trigger: "payment_confirmed", vars: { beløp: p.price }, studentId: user!.id });
    if (s.parentId) create({ recipientId: s.parentId, trigger: "payment_confirmed", vars: { beløp: p.price }, studentId: user!.id });
    toast.success(`Mock ${method}-betaling: ${p.name}`);
  };
  return (
    <>
      <PageHeader title={t("nav_payment")} description="Saldo, pakker og betaling. Mock-flyt — ingen reelle transaksjoner." />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Saldo" value={`${s.balanceNok} kr`} tone={s.balanceNok < 0 ? "destructive" : "success"} />
        <StatCard label="Brukte timer" value={s.lessons} />
        <StatCard label="Klasse" value={s.licenseClass} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((p) => (
          <Card key={p.id} className="p-5 flex flex-col">
            <div className="font-semibold">{p.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{p.lessons} timer</div>
            <div className="text-2xl font-bold mt-3">{p.price.toLocaleString("nb-NO")} kr</div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => pay(p, "Vipps")}><CreditCard /> Vipps</Button>
              <Button variant="outline" onClick={() => pay(p, "kort")}>Kort</Button>
              <Button variant="outline" onClick={() => pay(p, "faktura")}>Faktura</Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
