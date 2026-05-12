import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatusBadge } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { students, teachers, reports, auditLog, backupState } from "@/lib/mock-data";
import { ShieldCheck, FileDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tilsynsvisning")({
  head: () => ({ meta: [{ title: "Tilsynsvisning — Kjøreflyt" }] }),
  component: () => <RoleGate allow={["admin"]}><Sup /></RoleGate>,
});

function Sup() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader
        title={t("supervision_title")}
        description={t("supervision_sub")}
        actions={<Button onClick={() => toast.success("Tilsynspakke generert (mock)", { description: "EXP-2026-05-12-03 — alle bilag samlet i ZIP" })}><FileDown /> {t("generate_pkg")}</Button>}
      />

      <div className="bg-info/5 border border-info/30 rounded-md p-4 mb-6 flex items-start gap-3">
        <ShieldCheck className="size-5 text-info shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-semibold">Skrivebeskyttet visning</div>
          <div className="text-muted-foreground">Klar for umiddelbar presentasjon for Statens vegvesen. Alle endringer er sperret i denne modusen.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Skoleinformasjon">
          <Row k="Skolenavn" v="Oslo Trafikkskole AS" />
          <Row k="Org.nr" v="912 345 678" mono />
          <Row k="Faglig leder" v="Anders Johansen" />
          <Row k="Adresse" v="Storgata 14, 0184 Oslo" />
        </Section>

        <Section title="Backup & arkiv">
          <Row k="Siste signerte backup" v={backupState.signed ? `${backupState.month} (${backupState.signedBy})` : `${backupState.month} (ikke signert)`} />
          <Row k="Hash" v={backupState.hash} mono />
          <Row k="Oppbevaringspolicy" v={t("retention_5y")} />
          <Row k="Sletting" v="Sperret under oppbevaringsperiode" />
        </Section>

        <Section title={`Elever (${students.length})`}>
          <ul className="text-sm divide-y divide-border">
            {students.map((s) => (
              <li key={s.id} className="py-2 flex items-center justify-between gap-2">
                <span><span className="font-mono text-xs text-muted-foreground mr-2">{s.studentNo}</span>{s.name}</span>
                <StatusBadge tone={s.docStatus === "Komplett" ? "success" : s.docStatus === "Mangler" ? "destructive" : "warning"}>{s.docStatus}</StatusBadge>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={`Lærergodkjenninger (${teachers.length})`}>
          <ul className="text-sm divide-y divide-border">
            {teachers.map((t) => (
              <li key={t.id} className="py-2 flex items-center justify-between gap-2">
                <span>{t.name} <span className="text-muted-foreground text-xs">— {t.approvedClasses.join(", ")}</span></span>
                <StatusBadge tone={t.status === "Gyldig" ? "success" : t.status === "Utløpt" ? "destructive" : "warning"}>{t.status}</StatusBadge>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Rapporteringskø">
          <ul className="text-sm divide-y divide-border">
            {reports.map((r) => (
              <li key={r.id} className="py-2 flex items-center justify-between gap-2">
                <span className="truncate">{r.element} <span className="text-muted-foreground text-xs">— {r.id}</span></span>
                <StatusBadge tone={r.status === "Mottatt" || r.status === "Sendt" ? "success" : r.status === "Feilet" ? "destructive" : "warning"}>{r.status}</StatusBadge>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Revisjonslogg (utdrag)">
          <ul className="text-xs divide-y divide-border">
            {auditLog.slice(0, 6).map((a) => (
              <li key={a.id} className="py-2">
                <div className="font-mono text-muted-foreground">{new Date(a.ts).toLocaleString("nb-NO")}</div>
                <div className="font-medium">{a.action}</div>
                <div className="text-muted-foreground">{a.user} · {a.role} · {a.objectId}</div>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="space-y-2">{children}</div>
    </Card>
  );
}
function Row({ k, v, mono = false }: { k: string; v: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{v}</span>
    </div>
  );
}
