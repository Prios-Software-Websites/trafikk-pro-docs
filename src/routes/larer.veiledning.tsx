import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/larer/veiledning")({
  component: () => <RoleGate allow={["teacher"]}><Guidance /></RoleGate>,
});

function Guidance() {
  const { t } = useI18n();
  const [decision, setDecision] = useState<"yes" | "no" | "">("");
  return (
    <>
      <PageHeader title={t("nav_guidance")} description="Digital veiledningstime-protokoll for slutten av Trinn 2 og Trinn 3." />
      <Card className="p-6 max-w-3xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Elev"><Input defaultValue="Ingrid Bergfald" /></Field>
          <Field label="Trinn"><Input defaultValue="3" /></Field>
          <Field label="Dato"><Input type="date" defaultValue="2026-05-12" /></Field>
          <Field label="Varighet"><Input type="number" defaultValue={45} /></Field>
        </div>
        <Field label="Eleven sin egenvurdering"><Textarea rows={3} placeholder="Hva mestrer eleven, og hva er utfordrende?" /></Field>
        <Field label="Lærers vurdering"><Textarea rows={3} /></Field>
        <div>
          <div className="text-sm font-semibold mb-2">Kompetanseområder</div>
          {["Trafikal forståelse", "Risikoforståelse", "Selvinnsikt", "Kjøreteknisk"].map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm py-1"><input type="checkbox" /> {k}</label>
          ))}
        </div>
        <div>
          <div className="text-sm font-semibold mb-2">Eleven har tilstrekkelig kompetanse til å gå videre?</div>
          <div className="flex gap-2">
            <Button type="button" variant={decision === "yes" ? "default" : "outline"} onClick={() => setDecision("yes")}>Ja</Button>
            <Button type="button" variant={decision === "no" ? "destructive" : "outline"} onClick={() => setDecision("no")}>Nei</Button>
          </div>
        </div>
        <Field label="Anbefalte fokusområder"><Textarea rows={2} /></Field>
        <Button onClick={() => toast.success("Veiledningstime signert", { description: "Sendt til mock TSK-kø." })}>Signer protokoll</Button>
      </Card>
    </>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
