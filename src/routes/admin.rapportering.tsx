import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatusBadge } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { reports as initial, getStudent, getTeacher, type ReportItem } from "@/lib/mock-data";
import { useState } from "react";
import { toast } from "sonner";
import { Send, RefreshCw, Terminal, AlertTriangle } from "lucide-react";

const tone = (s: ReportItem["status"]) =>
  s === "Mottatt" ? "success" :
  s === "Sendt" ? "info" :
  s === "Klar for innsending" ? "info" :
  s === "Krever manuell kontroll" ? "warning" :
  s === "Feilet" ? "destructive" : "muted";

export const Route = createFileRoute("/admin/rapportering")({
  head: () => ({ meta: [{ title: "Rapportering — TrafikkDok. Pro" }] }),
  component: () => <RoleGate allow={["admin"]}><Reporting /></RoleGate>,
});

function Reporting() {
  const { t } = useI18n();
  const [items, setItems] = useState<ReportItem[]>([...initial]);

  const send = (id: string) => {
    setItems((prev) => prev.map((r) => r.id === id ? { ...r, status: "Sendt", attempts: r.attempts + 1, apiMessage: "QUEUED_FOR_TSK" } : r));
    setTimeout(() => {
      setItems((prev) => prev.map((r) => r.id === id ? { ...r, status: "Mottatt", apiMessage: `OK_TSK_REC_${Date.now().toString().slice(-6)}` } : r));
      toast.success("Mottatt av mock TSK-register");
    }, 900);
  };
  const retry = (id: string) => {
    setItems((prev) => prev.map((r) => r.id === id ? { ...r, attempts: r.attempts + 1, status: "Sendt", apiMessage: "RETRY_QUEUED" } : r));
    setTimeout(() => {
      setItems((prev) => prev.map((r) => r.id === id ? { ...r, status: "Krever manuell kontroll", apiMessage: "WARN_NEEDS_REVIEW" } : r));
    }, 1100);
  };

  return (
    <>
      <PageHeader
        title={t("reporting_title")}
        description={t("reporting_disclaimer")}
        actions={<Button variant="outline"><Terminal /> {t("api_log")}</Button>}
      />

      <Card className="p-4 mb-4 bg-info/5 border-info/30 flex items-start gap-3">
        <AlertTriangle className="size-5 text-info shrink-0 mt-0.5" />
        <div className="text-sm">
          <div className="font-semibold">Prototype</div>
          <div className="text-muted-foreground">Ingen reell innsending til Statens vegvesen. Statusoverganger er simulert med kort forsinkelse.</div>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map((r) => {
          const s = getStudent(r.studentId);
          const tch = getTeacher(r.teacherId);
          return (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="px-2 py-1 rounded bg-muted text-[10px] font-mono shrink-0">{r.id.toUpperCase()}</div>
                  <div className="min-w-0">
                    <div className="font-semibold">{r.element}</div>
                    <div className="text-xs text-muted-foreground">
                      {s?.name} · {s?.ssnMasked} · klasse {r.classRef} · {tch?.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Fullført {new Date(r.completedAt).toLocaleString("nb-NO")} · forsøk {r.attempts}
                    </div>
                    {r.apiMessage && <div className="mt-1 text-[11px] font-mono text-muted-foreground">API: {r.apiMessage}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={tone(r.status)}>{r.status}</StatusBadge>
                  {r.status === "Klar for innsending" && (
                    <Button size="sm" onClick={() => send(r.id)}><Send className="size-4" /> Send</Button>
                  )}
                  {r.status === "Feilet" && (
                    <Button size="sm" variant="destructive" onClick={() => retry(r.id)}><RefreshCw className="size-4" /> {t("retry")}</Button>
                  )}
                  {r.status === "Krever manuell kontroll" && (
                    <Button size="sm" variant="outline" onClick={() => toast("Manuell overstyring registrert")}>Overstyr</Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
