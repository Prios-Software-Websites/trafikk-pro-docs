import type { Student, Trinn } from "@/lib/mock-data";
import { Lock, CircleCheck, CircleDot, AlertCircle, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

const stepIcon = (s: Trinn["status"]) => {
  switch (s) {
    case "completed": return <CircleCheck className="size-4 text-success" />;
    case "available": return <CircleDot className="size-4 text-info" />;
    case "needs_assessment": return <AlertCircle className="size-4 text-warning-foreground" />;
    case "needs_reporting": return <Send className="size-4 text-info" />;
    case "locked":
    default: return <Lock className="size-4 text-muted-foreground" />;
  }
};

const stepClasses = (s: Trinn["status"]) => {
  switch (s) {
    case "completed": return "border-success/40 bg-success/5";
    case "available": return "border-info/40 bg-info/5 ring-2 ring-info/10";
    case "needs_assessment": return "border-warning/40 bg-warning/10";
    case "needs_reporting": return "border-info/40 bg-info/10";
    case "locked":
    default: return "border-dashed border-border bg-muted/30 opacity-60";
  }
};

export function TrainingCard({ student, compact = false }: { student: Student; compact?: boolean }) {
  const { t } = useI18n();
  const handle = (tr: Trinn) => {
    if (tr.status === "locked") {
      toast.warning(t("locked_step_msg"));
    } else if (tr.status === "needs_reporting") {
      toast.success("Sendt til mock TSK-kø", { description: `${tr.title} for ${student.name}` });
    } else if (tr.status === "needs_assessment") {
      toast("Veiledningstime klar for vurdering");
    } else {
      toast(`Trinn ${tr.number}: ${tr.title}`);
    }
  };

  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"}`}>
      {student.trinn.map((tr) => {
        const label =
          tr.status === "completed" ? "Fullført" :
          tr.status === "available" ? "Aktiv" :
          tr.status === "needs_assessment" ? "Krever vurdering" :
          tr.status === "needs_reporting" ? "Klar for rapportering" : "Låst";
        return (
          <button
            key={tr.number}
            onClick={() => handle(tr)}
            className={`text-left p-4 rounded-lg border transition-all hover:shadow-sm ${stepClasses(tr.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Trinn {tr.number}</span>
              {stepIcon(tr.status)}
            </div>
            <div className="font-semibold text-sm leading-snug">{tr.title}</div>
            <div className="mt-3 text-[11px] font-bold uppercase tracking-tight text-muted-foreground">{label}</div>
            {tr.required.length > 0 && (
              <ul className="mt-3 space-y-1">
                {tr.required.map((r) => {
                  const done = tr.completed.includes(r);
                  return (
                    <li key={r} className={`text-[11px] flex items-center gap-1.5 ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      <span className={`status-dot ${done ? "bg-success" : "bg-muted-foreground/40"}`} />
                      {r}
                    </li>
                  );
                })}
              </ul>
            )}
          </button>
        );
      })}
    </div>
  );
}
