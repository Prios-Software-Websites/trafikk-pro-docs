import { createFileRoute, Link } from "@tanstack/react-router";
import { RoleGate } from "@/components/RoleGate";
import { PageHeader } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { studentsForTeacher } from "@/lib/mock-data";

export const Route = createFileRoute("/larer/elever")({
  component: () => <RoleGate allow={["teacher"]}><MyStudents /></RoleGate>,
});

function MyStudents() {
  const { user } = useAuth();
  const { t } = useI18n();
  const list = studentsForTeacher(user!.id);
  return (
    <>
      <PageHeader title={t("nav_my_students")} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((s) => (
          <Link key={s.id} to="/admin/elever/$id" params={{ id: s.id }}>
            <Card className="p-5 hover:shadow-md transition-shadow">
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.studentNo} · Klasse {s.licenseClass} · {s.lessons} timer</div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
