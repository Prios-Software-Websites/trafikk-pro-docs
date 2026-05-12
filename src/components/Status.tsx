import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

type Tone = "success" | "warning" | "destructive" | "info" | "muted";

const styles: Record<Tone, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning-foreground border-warning/30",
  destructive: "bg-destructive/10 text-destructive border-destructive/30",
  info: "bg-info/10 text-info border-info/20",
  muted: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ tone = "muted", children, dot = true }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <Badge variant="outline" className={`gap-1.5 font-semibold border ${styles[tone]}`}>
      {dot && <span className={`status-dot ${tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : tone === "destructive" ? "bg-destructive" : tone === "info" ? "bg-info" : "bg-muted-foreground"}`} />}
      {children}
    </Badge>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, tone, hint }: { label: string; value: ReactNode; tone?: Tone; hint?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${
        tone === "destructive" ? "text-destructive" :
        tone === "warning" ? "text-warning-foreground" :
        tone === "success" ? "text-success" :
        tone === "info" ? "text-info" : ""
      }`}>{value}</div>
      {hint && <div className="mt-2 text-[11px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
