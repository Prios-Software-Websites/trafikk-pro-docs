import { createFileRoute, Link } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatCard } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getStudent, getTeacher } from "@/lib/mock-data";
import { TrainingCard } from "@/components/TrainingCard";

export const Route = createFileRoute("/elev/")({
  component: () => <RoleGate allow={["student"]}><Mine /></RoleGate>,
});

function Mine() {
  const { t } = useI18n();
  const s = getStudent("s-001")!;
  return (
    <>
      <PageHeader title={t("nav_progress")} description={`Velkommen, ${s.name}.`} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Klasse" value={s.licenseClass} />
        <StatCard label={t("total_lessons")} value={s.lessons} />
        <StatCard label="Saldo" value={`${s.balanceNok} kr`} tone={s.balanceNok < 0 ? "destructive" : "success"} />
        <StatCard label="Lærer" value={getTeacher(s.responsibleTeacherId)?.name ?? "—"} />
      </div>
      <Card className="p-5 mb-6">
        <h2 className="font-semibold mb-4">Min trinn-progresjon</h2>
        <TrainingCard student={s} />
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button asChild className="h-16"><Link to="/elev/book">{t("nav_book")}</Link></Button>
        <Button asChild variant="outline" className="h-16"><Link to="/elev/opplaeringskort">{t("nav_my_card")}</Link></Button>
        <Button asChild variant="outline" className="h-16"><Link to="/elev/ovingskjoring">{t("nav_practice")}</Link></Button>
        <Button asChild variant="outline" className="h-16"><Link to="/elev/betaling">{t("nav_payment")}</Link></Button>
      </div>
    </>
  );
}
