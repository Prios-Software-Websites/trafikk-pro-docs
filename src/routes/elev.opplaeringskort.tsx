import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { getStudent } from "@/lib/mock-data";
import { TrainingCard } from "@/components/TrainingCard";

export const Route = createFileRoute("/elev/opplaeringskort")({
  component: () => <RoleGate allow={["student"]}><MyCard /></RoleGate>,
});

function MyCard() {
  const { t } = useI18n();
  const s = getStudent("s-001")!;
  return (
    <>
      <PageHeader title={t("nav_my_card")} description={`Klasse ${s.licenseClass} · ${s.lessons} kjøretimer (${s.lessons * 45} min)`} />
      <Card className="p-5"><TrainingCard student={s} /></Card>
    </>
  );
}
