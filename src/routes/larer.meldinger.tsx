import { createFileRoute } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { messages, getStudent, getTeacher } from "@/lib/mock-data";

export const Route = createFileRoute("/larer/meldinger")({
  component: () => <RoleGate allow={["teacher"]}><Msgs /></RoleGate>,
});

function Msgs() {
  const { t } = useI18n();
  const threadIds = Array.from(new Set(messages.map((m) => m.threadId)));
  return (
    <>
      <PageHeader title={t("nav_messages")} description="Sikre meldinger med dine elever." />
      <div className="space-y-4">
        {threadIds.map((tid) => {
          const ms = messages.filter((m) => m.threadId === tid);
          return (
            <Card key={tid} className="p-5">
              <ul className="space-y-3">
                {ms.map((m) => (
                  <li key={m.id}>
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
