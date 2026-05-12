import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatusBadge } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getStudent, getTeacher, lessonsFor } from "@/lib/mock-data";
import { TrainingCard } from "@/components/TrainingCard";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/opplaeringskort/$id")({
  head: () => ({ meta: [{ title: "Opplæringskort — Kjøreflyt" }] }),
  component: () => <RoleGate allow={["admin"]}><Detail /></RoleGate>,
  loader: ({ params }) => { if (!getStudent(params.id)) throw notFound(); return null; },
});

function Detail() {
  const { t } = useI18n();
  const { id } = Route.useParams();
  const s = getStudent(id)!;
  const teacher = getTeacher(s.responsibleTeacherId);
  const ll = lessonsFor({ studentId: s.id });

  return (
    <>
      <Link to="/admin/opplaeringskort" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="size-4" /> Tilbake</Link>
      <PageHeader
        title={`${t("card_title")} — ${s.name}`}
        description={`${t("student_no")} ${s.studentNo} · ${t("class")} ${s.licenseClass}`}
        actions={<Button onClick={() => toast.success("Tilsynsvisning åpnet (skrivebeskyttet)")}><ShieldCheck /> {t("supervision_title")}</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Stat label={t("total_lessons")} value={s.lessons} />
        <Stat label={t("total_minutes")} value={`${s.lessons * 45} min`} />
        <Stat label={t("completed_mandatory")} value={`${s.mandatoryDone}/${s.mandatoryTotal}`} />
        <Stat label={t("responsible_teacher")} value={teacher?.name ?? "—"} />
      </div>

      <Card className="p-5 mb-6">
        <h2 className="font-semibold mb-4">Trinn 1–4</h2>
        <TrainingCard student={s} />
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-border font-semibold text-sm">Attesterte timer</div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-2">Dato</th>
              <th className="px-5 py-2">Type</th>
              <th className="px-5 py-2">Trinn</th>
              <th className="px-5 py-2">Tid</th>
              <th className="px-5 py-2">Lærer</th>
              <th className="px-5 py-2">Signatur</th>
              <th className="px-5 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ll.map((l) => (
              <tr key={l.id}>
                <td className="px-5 py-2 font-mono text-xs">{l.date} {l.start}</td>
                <td className="px-5 py-2">{l.type}</td>
                <td className="px-5 py-2">{l.trinn}</td>
                <td className="px-5 py-2">{l.durationMin} min</td>
                <td className="px-5 py-2 text-muted-foreground">{getTeacher(l.teacherId)?.name}</td>
                <td className="px-5 py-2 text-xs">{l.signature ?? "—"}</td>
                <td className="px-5 py-2">{l.attested ? <StatusBadge tone="success">Attestert</StatusBadge> : <StatusBadge tone="warning">Venter</StatusBadge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-2.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground italic">
          Attesterte poster kan ikke endres direkte. Korreksjon krever ny oppføring med begrunnelse.
        </div>
      </Card>
    </>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}
