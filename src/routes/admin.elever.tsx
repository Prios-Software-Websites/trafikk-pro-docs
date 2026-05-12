import { createFileRoute, Link } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { useI18n } from "@/lib/i18n";
import { PageHeader, StatusBadge } from "@/components/Status";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { students, teachers } from "@/lib/mock-data";
import { useState } from "react";
import { Download, FileText, Eye, ShieldCheck, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/elever")({
  head: () => ({ meta: [{ title: "Elevfortegnelse — Kjøreflyt" }] }),
  component: () => <RoleGate allow={["admin"]}><Elever /></RoleGate>,
});

function Elever() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [showSsn, setShowSsn] = useState<Record<string, boolean>>({});

  const list = students.filter((s) =>
    [s.name, s.studentNo, s.address, s.licenseClass].some((f) => f.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <>
      <PageHeader
        title={t("reg_title")}
        description={t("reg_retention")}
        actions={
          <>
            <Button variant="outline" onClick={() => toast("Eksport til PDF (mock)", { description: "Filgenerering simulert." })}><FileText /> {t("export_pdf")}</Button>
            <Button variant="outline" onClick={() => toast("Eksport til CSV (mock)")}><Download /> {t("export_csv")}</Button>
            <Button onClick={() => toast.success("Tilsynspakke generert (mock)", { description: "EXP-2026-05-12-02 · 24 sider, 14 vedlegg." })}><ShieldCheck /> {t("export_supervision")}</Button>
          </>
        }
      />

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="pl-9" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" />
            <span>{t("sensitive_masked")} · {t("retention_5y")}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">{t("student_no")}</TableHead>
                <TableHead>{t("full_name")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("address")}</TableHead>
                <TableHead>{t("ssn")}</TableHead>
                <TableHead>{t("class")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("responsible_teacher")}</TableHead>
                <TableHead>{t("doc_status")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((s) => {
                const tt = teachers.find((x) => x.id === s.responsibleTeacherId);
                const docTone = s.docStatus === "Komplett" ? "success" : s.docStatus === "Mangler" ? "destructive" : "warning";
                const stTone = s.status === "Aktiv" ? "info" : s.status === "Pause" ? "warning" : "muted";
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-xs">{s.studentNo}</TableCell>
                    <TableCell className="font-semibold">{s.name}</TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{s.address}</TableCell>
                    <TableCell>
                      <button onClick={() => setShowSsn((p) => ({ ...p, [s.id]: !p[s.id] }))} className="font-mono text-xs hover:text-primary inline-flex items-center gap-1.5">
                        <Eye className="size-3" />
                        {showSsn[s.id] ? s.ssnMasked.replace("*****", "12345") : s.ssnMasked}
                      </button>
                    </TableCell>
                    <TableCell><span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold">{s.licenseClass}</span></TableCell>
                    <TableCell><StatusBadge tone={stTone}>{s.status}</StatusBadge></TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{tt?.name}</TableCell>
                    <TableCell><StatusBadge tone={docTone}>{s.docStatus}</StatusBadge></TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="ghost"><Link to="/admin/elever/$id" params={{ id: s.id }}>{t("open")}</Link></Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="px-4 py-2.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground italic text-center">
          Sletting er sperret. Bruk «Arkivert». Oppbevares i minimum 5 år, jf. Forskrift om trafikkopplæring.
        </div>
      </Card>
    </>
  );
}
