import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatusBadge } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { studentsForTeacher } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/larer/attestering")({
  component: () => <RoleGate allow={["teacher"]}><Attest /></RoleGate>,
});

function Attest() {
  const { user } = useAuth();
  const { t } = useI18n();
  const my = studentsForTeacher(user!.id);
  const [step, setStep] = useState(1);
  const [signed, setSigned] = useState(false);

  const sign = () => {
    setSigned(true);
    toast.success("Time signert med Sikker PIN", { description: "Lagret i revisjonslogg. Sendt til mock TSK-kø." });
  };

  return (
    <>
      <PageHeader title={t("nav_attest")} description="Registrer og signer kjøretime, obligatorisk element eller veiledningstime." />
      <Card className="p-6 max-w-3xl">
        {!signed ? (
          <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); sign(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Elev">
                <Select defaultValue={my[0]?.id}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{my.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Klasse">
                <Select defaultValue="B">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["B","BE","A","A2","C","CE"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Trinn">
                <Select defaultValue="3"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[1,2,3,4].map((n) => <SelectItem key={n} value={String(n)}>Trinn {n}</SelectItem>)}</SelectContent></Select>
              </Field>
              <Field label="Type">
                <Select defaultValue="Ordinær"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["Ordinær","Obligatorisk","Veiledningstime"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
              </Field>
              <Field label="Dato"><Input type="date" defaultValue="2026-05-12" /></Field>
              <Field label="Starttid"><Input type="time" defaultValue="08:00" /></Field>
              <Field label="Varighet (min)"><Input type="number" defaultValue={90} /></Field>
            </div>
            <Field label="Notater"><Textarea placeholder="Kort beskrivelse av timens innhold…" rows={3} /></Field>
            <div className="border-t pt-4">
              <div className="text-sm font-semibold mb-2">Vurderingssjekkliste</div>
              <ul className="space-y-1.5 text-sm">
                {["Bremsing", "Observasjon", "Plassering", "Kommunikasjon"].map((c) => (
                  <li key={c} className="flex items-center gap-2"><input type="checkbox" defaultChecked /> {c}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between border-t pt-4">
              <div className="text-xs text-muted-foreground flex items-center gap-2"><ShieldCheck className="size-4 text-info" /> Signering med Sikker PIN. Attesterte poster kan ikke endres.</div>
              <Button type="submit"><ShieldCheck /> Signer & lagre</Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto size-12 rounded-full bg-success/10 text-success grid place-items-center mb-3"><ShieldCheck className="size-6" /></div>
            <h2 className="font-bold text-lg">Time signert</h2>
            <p className="text-sm text-muted-foreground mt-1">Lagret i revisjonslogg og sendt til mock TSK-kø ved obligatorisk element.</p>
            <StatusBadge tone="success" dot={false}>Sikker PIN</StatusBadge>
            <div className="mt-6"><Button variant="outline" onClick={() => setSigned(false)}>Registrer ny time</Button></div>
          </div>
        )}
      </Card>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
