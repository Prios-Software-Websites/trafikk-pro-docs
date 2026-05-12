import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { messages, getStudent, getTeacher } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/meldinger")({
  head: () => ({ meta: [{ title: "Meldinger — TrafikkDok. Pro" }] }),
  component: () => <RoleGate allow={["admin", "teacher", "student", "parent"]}><Msgs /></RoleGate>,
});

function Msgs() {
  const { t } = useI18n();
  const { user } = useAuth();
  const threadIds = Array.from(new Set(messages.map((m) => m.threadId)));
  return (
    <>
      <PageHeader title={t("nav_messages")} description={user?.role === "admin" ? "Administrativ innsyn i kommunikasjon (audit-loggført)." : "Sikre meldinger mellom elev og lærer."} />
      <div className="space-y-4">
        {threadIds.map((tid) => {
          const ms = messages.filter((m) => m.threadId === tid);
          const first = ms[0];
          const partner = getStudent(first.toId) || getStudent(first.fromId) || getTeacher(first.toId) || getTeacher(first.fromId);
          return (
            <Card key={tid} className="p-5">
              <div className="font-semibold mb-3">Tråd med {partner?.name}</div>
              <ul className="space-y-3">
                {ms.map((m) => (
                  <li key={m.id} className="flex flex-col">
                    <div className="text-xs text-muted-foreground">{getStudent(m.fromId)?.name ?? getTeacher(m.fromId)?.name} · {new Date(m.ts).toLocaleString("nb-NO")}</div>
                    <div className="text-sm bg-muted/40 rounded-md p-3 mt-1 max-w-prose">{m.body}</div>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}
