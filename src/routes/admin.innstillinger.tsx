import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/innstillinger")({
  head: () => ({ meta: [{ title: "Innstillinger — TrafikkDok. Pro" }] }),
  component: () => <RoleGate allow={["admin"]}><Settings /></RoleGate>,
});

function Settings() {
  const { t, lang, setLang } = useI18n();
  const [hours, setHours] = useState(48);
  const [requireBalance, setRequireBalance] = useState(true);

  return (
    <>
      <PageHeader title={t("settings_title")} description="Skoleregler, språk og policy." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h2 className="font-semibold">Booking-regler</h2>
          <div className="space-y-2">
            <Label>{t("cancel_rule")}</Label>
            <Input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="max-w-32" />
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <Label>Krev positiv saldo for booking</Label>
              <p className="text-xs text-muted-foreground">Eleven må ha balanse ≥ 0 for å booke ny time.</p>
            </div>
            <Switch checked={requireBalance} onCheckedChange={setRequireBalance} />
          </div>
          <Button onClick={() => toast.success("Innstillinger lagret")}>{t("save")}</Button>
        </Card>

        <Card className="p-5 space-y-4">
          <h2 className="font-semibold">{t("language")}</h2>
          <div className="flex gap-2">
            <Button variant={lang === "nb" ? "default" : "outline"} onClick={() => setLang("nb")}>Norsk Bokmål</Button>
            <Button variant={lang === "en" ? "default" : "outline"} onClick={() => setLang("en")}>English</Button>
          </div>
          <p className="text-xs text-muted-foreground border-t pt-3">Flere språk kan legges til senere uten kodeendring.</p>
        </Card>

        <Card className="p-5 md:col-span-2 space-y-3">
          <h2 className="font-semibold">Personvern og sikkerhet</h2>
          <ul className="text-sm space-y-1.5 text-muted-foreground list-disc pl-5">
            <li>Sensitive data kryptert i ro (mock).</li>
            <li>Rollebasert tilgangskontroll aktiv.</li>
            <li>Revisjonslogg aktiv på alle viktige handlinger.</li>
            <li>Oppbevaringspolicy: 5 år, sletting sperret i perioden.</li>
            <li>Mock to-faktor pålogging og BankID/Vipps-signering.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}
