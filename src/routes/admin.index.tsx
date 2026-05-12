import { createFileRoute, Link } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { useI18n } from "@/lib/i18n";
import { PageHeader, StatCard, StatusBadge } from "@/components/Status";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { backupState, computeComplianceScore, reports, students, teachers, auditLog } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, AlertTriangle, FileText, ClockAlert, Database, FileWarning, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Kjøreflyt" }] }),
  component: () => <RoleGate allow={["admin"]}><AdminDashboard /></RoleGate>,
});

function AdminDashboard() {
  const { t } = useI18n();
  const [score, setScore] = useState(computeComplianceScore());
  const [backup, setBackup] = useState({ ...backupState });

  const tone = score >= 90 ? "success" : score >= 75 ? "warning" : "destructive";
  const ring = tone === "success" ? "stroke-success" : tone === "warning" ? "stroke-warning" : "stroke-destructive";

  const signBackup = () => {
    const now = new Date();
    backupState.signed = true;
    backupState.signedBy = "Anders Johansen";
    backupState.signedAt = now.toISOString();
    setBackup({ ...backupState });
    setScore(computeComplianceScore());
    toast.success("Månedlig backup signert", { description: `Hash ${backupState.hash.slice(0, 12)}…` });
  };

  const active = students.filter((s) => s.status === "Aktiv").length;
  const missing = students.filter((s) => s.docStatus === "Mangler").length;
  const ready = reports.filter((r) => r.status === "Klar for innsending").length;
  const failed = reports.filter((r) => r.status === "Feilet").length;
  const expiringTeachers = teachers.filter((t) => t.status !== "Gyldig").length;

  return (
    <>
      <PageHeader
        title={t("nav_dashboard")}
        description="Compliance-oversikt for skolen — etterlevelse, rapportering og dokumentasjon."
        actions={
          <>
            <Button variant="outline" asChild><Link to="/admin/tilsynsvisning"><ShieldCheck className="size-4" /> {t("supervision_title")}</Link></Button>
            <Button asChild><Link to="/admin/rapportering"><ArrowRight className="size-4" /> {t("nav_reporting")}</Link></Button>
          </>
        }
      />

      {/* Hero: Compliance score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t("compliance_score")}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-bold">{score}</span>
                <span className="text-sm text-muted-foreground">/ 100</span>
                <StatusBadge tone={tone}>{tone === "success" ? "Godkjent" : tone === "warning" ? "Krever oppfølging" : "Avvik"}</StatusBadge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">{t("compliance_caption")}. Skår beregnes fra manglende dokumentasjon, usignert backup, ugyldige lærertildelinger og feilet rapportering.</p>
            </div>
            <div className="relative size-28 shrink-0">
              <svg className="size-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" strokeWidth="8" fill="none" className="stroke-muted" />
                <circle cx="50" cy="50" r="42" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={`${(score / 100) * 263.9} 263.9`} className={ring} />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <span className="text-2xl font-bold">{score}%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Mini label="Manglende dok." value={missing} tone="warning" />
            <Mini label="Klar for TSK" value={ready} tone="info" />
            <Mini label="Feilet rapport." value={failed} tone={failed > 0 ? "destructive" : "muted"} />
            <Mini label="Lærergodkj." value={expiringTeachers} tone="warning" />
          </div>
        </Card>

        <Card className={`p-6 ${backup.signed ? "bg-success/5 border-success/30" : "bg-destructive/5 border-destructive/30"}`}>
          <div className="flex items-start gap-3">
            <div className={`size-10 rounded-md grid place-items-center ${backup.signed ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
              <Database className="size-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Månedlig backup</div>
              <div className="font-semibold">{backup.month}</div>
            </div>
          </div>
          {backup.signed ? (
            <>
              <p className="mt-4 text-sm text-muted-foreground">Backup verifisert og signert av faglig leder.</p>
              <div className="mt-3 text-xs space-y-1 font-mono text-muted-foreground">
                <div>Av: {backup.signedBy}</div>
                <div>Tid: {new Date(backup.signedAt!).toLocaleString("nb-NO")}</div>
                <div>Hash: {backup.hash.slice(0, 16)}…</div>
              </div>
            </>
          ) : (
            <>
              <p className="mt-4 text-sm text-muted-foreground">Forrige måneds dokumentasjon må verifiseres for å oppfylle tilsynskravet.</p>
              <Button className="w-full mt-4" onClick={signBackup}>{t("sign_monthly_backup")}</Button>
            </>
          )}
        </Card>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label={t("active_students")} value={active} hint="+12% siste måned" />
        <StatCard label={t("missing_docs")} value={missing} tone={missing > 0 ? "warning" : "success"} hint="Krever oppfølging" />
        <StatCard label={t("ready_for_reporting")} value={ready} tone="info" hint="TSK_QUEUE_PENDING" />
        <StatCard label={t("reporting_failed")} value={failed} tone={failed > 0 ? "destructive" : "success"} hint="Krever manuell handling" />
        <StatCard label={t("approvals_expiring")} value={expiringTeachers} tone="warning" hint="Sjekk kompetansebevis" />
        <StatCard label={t("backup_unsigned")} value={backup.signed ? "0" : "1"} tone={backup.signed ? "success" : "destructive"} />
        <StatCard label={t("last_supervision_export")} value="2026-05-12" hint="EXP-2026-05-12-01" />
        <StatCard label={t("deviations_30d")} value="3" tone="warning" hint="2 lukkede, 1 åpen" />
      </div>

      {/* Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="font-semibold text-sm">Siste hendelser</div>
            <Link to="/admin/revisjonslogg" className="text-xs text-primary hover:underline">Hele revisjonsloggen →</Link>
          </div>
          <ul className="divide-y divide-border">
            {auditLog.slice(0, 5).map((a) => (
              <li key={a.id} className="px-5 py-3 flex items-center gap-4">
                <div className="size-8 rounded-md bg-muted grid place-items-center text-muted-foreground"><FileText className="size-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.action}</div>
                  <div className="text-xs text-muted-foreground">{a.user} · {a.role} · {a.objectId}</div>
                </div>
                <div className="text-xs text-muted-foreground font-mono">{new Date(a.ts).toLocaleString("nb-NO")}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="font-semibold text-sm mb-3">Krever handling</div>
          <ul className="space-y-3">
            <ActionItem icon={<FileWarning />} label="4 elever mangler dokumentasjon" tone="warning" to="/admin/elever" />
            <ActionItem icon={<AlertTriangle />} label="1 rapportering feilet" tone="destructive" to="/admin/rapportering" />
            <ActionItem icon={<ClockAlert />} label="2 lærergodkjenninger utløper" tone="warning" to="/admin/laerere" />
            <ActionItem icon={<Database />} label={backup.signed ? "Backup signert" : "Backup mangler signering"} tone={backup.signed ? "success" : "destructive"} to="/admin" />
          </ul>
        </Card>
      </div>
    </>
  );
}

function Mini({ label, value, tone }: { label: string; value: number | string; tone: "success" | "warning" | "destructive" | "info" | "muted" }) {
  const cls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning-foreground" : tone === "destructive" ? "text-destructive" : tone === "info" ? "text-info" : "text-foreground";
  return (
    <div className="p-3 rounded-md bg-muted/40 border border-border">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-xl font-bold ${cls}`}>{value}</div>
    </div>
  );
}

function ActionItem({ icon, label, tone, to }: { icon: React.ReactNode; label: string; tone: "warning" | "destructive" | "success"; to: string }) {
  const cls = tone === "destructive" ? "bg-destructive/10 text-destructive" : tone === "warning" ? "bg-warning/10 text-warning-foreground" : "bg-success/10 text-success";
  return (
    <li>
      <Link to={to} className="flex items-center gap-3 group">
        <div className={`size-8 rounded-md grid place-items-center ${cls}`}>{icon}</div>
        <span className="text-sm flex-1 group-hover:underline">{label}</span>
        <ArrowRight className="size-3.5 text-muted-foreground" />
      </Link>
    </li>
  );
}
