import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatusBadge } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { teachers } from "@/lib/mock-data";
import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

export const Route = createFileRoute("/admin/laerere")({
  head: () => ({ meta: [{ title: "Lærere — TrafikkDok. Pro" }] }),
  component: () => <RoleGate allow={["admin"]}><Teachers /></RoleGate>,
});

function Teachers() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t("nav_teachers")} description="Lærergodkjenninger og kompetanse. Lærere kan kun tildeles timer i klasser hvor godkjenning er gyldig." />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teachers.map((tch) => {
          const tone = tch.status === "Gyldig" ? "success" : tch.status === "Utløper snart" ? "warning" : tch.status === "Utløpt" ? "destructive" : "warning";
          const Icon = tch.status === "Gyldig" ? ShieldCheck : tch.status === "Utløpt" ? ShieldX : ShieldAlert;
          return (
            <Card key={tch.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 text-primary grid place-items-center font-bold text-sm">
                    {tch.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="font-semibold">{tch.name}</div>
                    <div className="text-xs text-muted-foreground">{tch.email}</div>
                  </div>
                </div>
                <Icon className={`size-5 ${tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-warning-foreground"}`} />
              </div>
              <StatusBadge tone={tone}>{tch.status}</StatusBadge>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Klasser" value={tch.approvedClasses.join(", ")} />
                <Row label="Gyldig til" value={tch.approvalValidTo} mono />
                <Row label="Førstehjelp" value={tch.firstAid ? "Godkjent" : "—"} />
                <Row label="Sikkerhetskurs bane" value={tch.trackSafety ? "Godkjent" : "—"} />
                <Row label="Tunge kjøretøy" value={tch.heavyVehicle ? "Godkjent" : "—"} />
                <Row label="Motorsykkel" value={tch.motorcycle ? "Godkjent" : "—"} />
              </div>
              {tch.status === "Utløpt" && (
                <div className="mt-4 p-3 rounded bg-destructive/10 text-destructive text-xs">
                  Booking og attestering blokkert til godkjenning er fornyet.
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}

function Row({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">{label}</span>
      <span className={mono ? "font-mono text-xs" : "text-sm"}>{value}</span>
    </div>
  );
}
