import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatCard } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { practice as initial } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import { MapPinned } from "lucide-react";

export const Route = createFileRoute("/elev/ovingskjoring")({
  component: () => <RoleGate allow={["student", "parent"]}><Practice /></RoleGate>,
});

function Practice() {
  const { t } = useI18n();
  const [list, setList] = useState(initial.filter((p) => p.studentId === "s-001"));
  const totalKm = list.reduce((a, p) => a + p.km, 0);
  const totalMin = list.reduce((a, p) => {
    const [sh, sm] = p.startTime.split(":").map(Number);
    const [eh, em] = p.endTime.split(":").map(Number);
    return a + (eh * 60 + em - sh * 60 - sm);
  }, 0);

  const add = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setList((l) => [...l, {
      id: `pp-${l.length + 1}`,
      studentId: "s-001",
      date: String(f.get("date")),
      startTime: String(f.get("start")),
      endTime: String(f.get("end")),
      km: Number(f.get("km")),
      route: String(f.get("route")),
      weather: String(f.get("weather")),
      traffic: String(f.get("traffic")),
      accompanying: String(f.get("ledsager")),
      notes: String(f.get("notes")),
      sharedWithTeacher: false,
    }]);
    toast.success("Øvingstur logget");
    e.currentTarget.reset();
  };

  return (
    <>
      <PageHeader title={t("nav_practice")} description="Privat øvingskjøring er ikke attestert obligatorisk opplæring, men kan brukes som grunnlag for veiledning." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Antall turer" value={list.length} />
        <StatCard label="Totalt km" value={totalKm} />
        <StatCard label="Total tid" value={`${Math.floor(totalMin / 60)}t ${totalMin % 60}m`} />
        <StatCard label="Delt med lærer" value={list.filter((p) => p.sharedWithTeacher).length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-1 space-y-3">
          <h2 className="font-semibold">Logg ny tur</h2>
          <form onSubmit={add} className="space-y-3">
            <Field label="Dato"><Input name="date" type="date" required defaultValue="2026-05-12" /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Start"><Input name="start" type="time" required defaultValue="17:00" /></Field>
              <Field label="Slutt"><Input name="end" type="time" required defaultValue="18:30" /></Field>
            </div>
            <Field label="Km"><Input name="km" type="number" required defaultValue={20} /></Field>
            <Field label="Rute"><Input name="route" placeholder="F.eks. Oslo–Bærum t/r" required /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Vær"><Input name="weather" defaultValue="Sol" /></Field>
              <Field label="Trafikk"><Input name="traffic" defaultValue="Moderat" /></Field>
            </div>
            <Field label="Ledsager"><Input name="ledsager" required defaultValue="Kari Johansen" /></Field>
            <Field label="Refleksjon"><Textarea name="notes" rows={2} /></Field>
            <Button type="submit" className="w-full">Lagre tur</Button>
          </form>
        </Card>

        <Card className="p-0 overflow-hidden lg:col-span-2">
          <div className="px-5 py-3 border-b border-border font-semibold text-sm flex items-center gap-2"><MapPinned className="size-4" /> Mine turer</div>
          <ul className="divide-y divide-border">
            {list.map((p) => (
              <li key={p.id} className="px-5 py-3">
                <div className="flex justify-between"><div className="font-medium">{p.route}</div><span className="text-xs text-muted-foreground">{p.date}</span></div>
                <div className="text-xs text-muted-foreground mt-1">{p.startTime}–{p.endTime} · {p.km} km · {p.weather} · {p.traffic} · m/ {p.accompanying}</div>
                {p.notes && <div className="text-xs mt-1 italic text-muted-foreground">"{p.notes}"</div>}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
