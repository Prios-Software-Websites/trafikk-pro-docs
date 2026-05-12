import { createFileRoute, Link } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatCard, StatusBadge } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { studentsForTeacher, lessonsFor, getStudent } from "@/lib/mock-data";
import { toast } from "sonner";
import { Pen } from "lucide-react";

export const Route = createFileRoute("/larer/")({
  head: () => ({ meta: [{ title: "Min dag — TrafikkDok. Pro" }] }),
  component: () => <RoleGate allow={["teacher"]}><Day /></RoleGate>,
});

function Day() {
  const { user } = useAuth();
  const { t } = useI18n();
  const myStudents = studentsForTeacher(user!.id);
  const myLessons = lessonsFor({ teacherId: user!.id });
  const today = myLessons.filter((l) => l.date === "2026-05-12");

  return (
    <>
      <PageHeader title={t("nav_my_day")} description={`Velkommen, ${user?.name}.`} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Mine elever" value={myStudents.length} />
        <StatCard label="Timer i dag" value={today.length} tone="info" />
        <StatCard label="Venter attestering" value={myLessons.filter((l) => !l.attested).length} tone="warning" />
        <StatCard label="Godkjenning gyldig til" value="2027-04-12" />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-border font-semibold text-sm">I dag</div>
        <ul className="divide-y divide-border">
          {today.map((l) => {
            const s = getStudent(l.studentId);
            return (
              <li key={l.id} className="px-5 py-4 flex items-center gap-4 flex-wrap">
                <div className="font-mono text-lg w-20">{l.start}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{s?.name}</div>
                  <div className="text-xs text-muted-foreground">{l.type} · Trinn {l.trinn} · {l.durationMin} min</div>
                </div>
                {l.attested ? <StatusBadge tone="success">Attestert</StatusBadge> : (
                  <Button onClick={() => toast.success("Time attestert (mock signatur)")}><Pen /> Attester</Button>
                )}
              </li>
            );
          })}
          {today.length === 0 && <li className="px-5 py-6 text-muted-foreground text-sm">Ingen timer i dag.</li>}
        </ul>
      </Card>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="font-semibold mb-2">Mine elever</div>
          <ul className="text-sm divide-y divide-border">
            {myStudents.map((s) => (
              <li key={s.id} className="py-2 flex items-center justify-between">
                <Link to="/admin/elever/$id" params={{ id: s.id }} className="hover:underline">{s.name}</Link>
                <span className="text-xs text-muted-foreground">Trinn {s.trinn.find((tr) => tr.status === "available")?.number ?? "—"}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <div className="font-semibold mb-2">Hurtighandlinger</div>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="outline"><Link to="/larer/attestering">Registrer time</Link></Button>
            <Button asChild variant="outline"><Link to="/larer/veiledning">Veiledningstime</Link></Button>
            <Button asChild variant="outline"><Link to="/larer/kalender">Kalender</Link></Button>
            <Button asChild variant="outline"><Link to="/larer/meldinger">Meldinger</Link></Button>
          </div>
        </Card>
      </div>
    </>
  );
}
