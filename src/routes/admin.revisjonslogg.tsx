import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader, StatusBadge } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { auditLog } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/revisjonslogg")({
  head: () => ({ meta: [{ title: "Revisjonslogg — TrafikkDok. Pro" }] }),
  component: () => <RoleGate allow={["admin"]}><Audit /></RoleGate>,
});

function Audit() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t("audit_title")} description="Alle viktige handlinger logges med tidsstempel, bruker, rolle og signatur." />
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-2">Tid</th>
              <th className="text-left px-5 py-2">Bruker</th>
              <th className="text-left px-5 py-2">Rolle</th>
              <th className="text-left px-5 py-2">Handling</th>
              <th className="text-left px-5 py-2">Objekt</th>
              <th className="text-left px-5 py-2">Signatur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {auditLog.map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-3 font-mono text-xs">{new Date(a.ts).toLocaleString("nb-NO")}</td>
                <td className="px-5 py-3">{a.user}</td>
                <td className="px-5 py-3 text-muted-foreground">{a.role}</td>
                <td className="px-5 py-3 font-medium">{a.action}</td>
                <td className="px-5 py-3 text-xs"><span className="text-muted-foreground">{a.object}</span> · <span className="font-mono">{a.objectId}</span></td>
                <td className="px-5 py-3">{a.signature ? <StatusBadge tone="success">{a.signature}</StatusBadge> : <span className="text-muted-foreground text-xs">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
