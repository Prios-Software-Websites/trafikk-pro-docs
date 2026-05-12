import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { useI18n } from "@/lib/i18n";
import { PageHeader, StatusBadge } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStudent, getTeacher, lessonsFor, practice } from "@/lib/mock-data";
import { TrainingCard } from "@/components/TrainingCard";
import { ArrowLeft, IdCard, MapPinned } from "lucide-react";

export const Route = createFileRoute("/admin/elever/$id")({
  head: () => ({ meta: [{ title: "Elev — TrafikkDok. Pro" }] }),
  component: () => <RoleGate allow={["admin"]}><Detail /></RoleGate>,
  notFoundComponent: () => <div className="p-8">Elev ikke funnet</div>,
  loader: ({ params }) => {
    if (!getStudent(params.id)) throw notFound();
    return null;
  },
});

function Detail() {
  const { t } = useI18n();
  const { id } = Route.useParams();
  const s = getStudent(id)!;
  const teacher = getTeacher(s.responsibleTeacherId);
  const ll = lessonsFor({ studentId: s.id });
  const pp = practice.filter((p) => p.studentId === s.id);

  return (
    <>
      <Link to="/admin/elever" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"><ArrowLeft className="size-4" /> Tilbake</Link>
      <PageHeader
        title={s.name}
        description={`${t("student_no")} ${s.studentNo} · ${t("class")} ${s.licenseClass} · ${t("responsible_teacher")}: ${teacher?.name}`}
        actions={
          <>
            <Button asChild variant="outline"><Link to="/admin/opplaeringskort/$id" params={{ id: s.id }}><IdCard /> {t("nav_training_card")}</Link></Button>
            <StatusBadge tone={s.status === "Aktiv" ? "info" : "muted"}>{s.status}</StatusBadge>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <h2 className="font-semibold mb-4">Trinn-oversikt</h2>
          <TrainingCard student={s} compact />
        </Card>
        <Card className="p-5 space-y-3 text-sm">
          <Row label={t("address")} value={s.address} />
          <Row label={t("ssn")} value={s.ssnMasked} mono />
          <Row label={t("start_date")} value={s.startDate} mono />
          {s.endDate && <Row label={t("end_date")} value={s.endDate} mono />}
          <Row label={t("total_lessons")} value={`${s.lessons} (${s.lessons * 45} min)`} />
          <Row label={t("completed_mandatory")} value={`${s.mandatoryDone} / ${s.mandatoryTotal}`} />
          <Row label={t("doc_status")} value={<StatusBadge tone={s.docStatus === "Komplett" ? "success" : s.docStatus === "Mangler" ? "destructive" : "warning"}>{s.docStatus}</StatusBadge>} />
          <Row label="Saldo" value={<span className={s.balanceNok < 0 ? "text-destructive font-semibold" : "text-success font-semibold"}>{s.balanceNok.toLocaleString("nb-NO")} kr</span>} />
          <div className="pt-3 border-t border-border text-[11px] text-muted-foreground italic">{t("sensitive_masked")} · GDPR.</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-border font-semibold text-sm">Kjøretimer</div>
          <ul className="divide-y divide-border text-sm">
            {ll.length === 0 && <li className="px-5 py-4 text-muted-foreground">Ingen registrerte timer.</li>}
            {ll.map((l) => (
              <li key={l.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{l.type} · Trinn {l.trinn}</div>
                  <div className="text-xs text-muted-foreground">{l.date} kl {l.start} · {l.durationMin} min</div>
                </div>
                {l.attested ? <StatusBadge tone="success">Attestert</StatusBadge> : <StatusBadge tone="warning">Venter</StatusBadge>}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-border font-semibold text-sm flex items-center gap-2"><MapPinned className="size-4" /> Privat øvingskjøring</div>
          <ul className="divide-y divide-border text-sm">
            {pp.length === 0 && <li className="px-5 py-4 text-muted-foreground">Ingen øvingsturer logget.</li>}
            {pp.map((p) => (
              <li key={p.id} className="px-5 py-3">
                <div className="flex justify-between">
                  <div className="font-medium">{p.route}</div>
                  <span className="text-xs text-muted-foreground">{p.date}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.km} km · {p.weather} · {p.traffic} · m/ {p.accompanying}</div>
              </li>
            ))}
          </ul>
          <div className="px-5 py-2.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground italic">
            Privat øvingskjøring er ikke attestert obligatorisk opplæring.
          </div>
        </Card>
      </div>
    </>
  );
}

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold">{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  );
}
