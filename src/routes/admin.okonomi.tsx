import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatCard } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { packages, students } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/okonomi")({
  head: () => ({ meta: [{ title: "Økonomi — TrafikkDok. Pro" }] }),
  component: () => <RoleGate allow={["admin"]}><Econ /></RoleGate>,
});

function Econ() {
  const { t } = useI18n();
  const total = students.reduce((acc, s) => acc + Math.max(0, s.balanceNok), 0);
  const owed = students.reduce((acc, s) => acc + Math.max(0, -s.balanceNok), 0);
  return (
    <>
      <PageHeader title={t("nav_economy")} description="Pakker, priser og kundebalanser." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Saldo elever" value={`${total.toLocaleString("nb-NO")} kr`} tone="success" />
        <StatCard label="Utestående" value={`${owed.toLocaleString("nb-NO")} kr`} tone="destructive" />
        <StatCard label="Pakker" value={packages.length} />
        <StatCard label="Mock betalingsmetoder" value="Vipps · Kort · Faktura" />
      </div>

      <Card className="p-0 overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border font-semibold">Aktive pakker</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left px-5 py-2">Navn</th><th className="text-left px-5 py-2">Antall timer</th><th className="text-right px-5 py-2">Pris</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {packages.map((p) => (
              <tr key={p.id}><td className="px-5 py-3 font-medium">{p.name}</td><td className="px-5 py-3">{p.lessons}</td><td className="px-5 py-3 text-right font-mono">{p.price.toLocaleString("nb-NO")} kr</td></tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-border font-semibold">Elevbalanse</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left px-5 py-2">Elev</th><th className="text-left px-5 py-2">Klasse</th><th className="text-right px-5 py-2">Saldo</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((s) => (
              <tr key={s.id}>
                <td className="px-5 py-3">{s.name}</td>
                <td className="px-5 py-3">{s.licenseClass}</td>
                <td className={`px-5 py-3 text-right font-mono font-semibold ${s.balanceNok < 0 ? "text-destructive" : "text-success"}`}>{s.balanceNok.toLocaleString("nb-NO")} kr</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
