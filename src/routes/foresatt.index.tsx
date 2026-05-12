import { createFileRoute, Link } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatCard } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getStudent } from "@/lib/mock-data";

export const Route = createFileRoute("/foresatt/")({
  component: () => <RoleGate allow={["parent"]}><Overview /></RoleGate>,
});

function Overview() {
  const { t } = useI18n();
  const s = getStudent("s-001")!;
  return (
    <>
      <PageHeader title={t("nav_overview")} description={`Innsyn for ${s.name}.`} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Klasse" value={s.licenseClass} />
        <StatCard label="Kjøretimer" value={s.lessons} />
        <StatCard label="Saldo" value={`${s.balanceNok} kr`} tone={s.balanceNok < 0 ? "destructive" : "success"} />
        <StatCard label="Status" value={s.status} />
      </div>
      <Card className="p-5">
        <p className="text-sm text-muted-foreground mb-4">Som foresatt har du innsyn — men kan ikke endre formell opplæringsdokumentasjon.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button asChild variant="outline"><Link to="/foresatt/okonomi">Økonomi</Link></Button>
          <Button asChild variant="outline"><Link to="/foresatt/ovingskjoring">Privat øvingskjøring</Link></Button>
          <Button asChild variant="outline"><Link to="/foresatt/meldinger">Meldinger</Link></Button>
        </div>
      </Card>
    </>
  );
}
