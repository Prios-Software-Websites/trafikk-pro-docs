import { Bell, AlertTriangle, Clock, MailWarning, ShieldAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNotifications, CHANNEL_LABEL } from "@/lib/notifications";
import { useAuth } from "@/lib/auth";

const ROLE_PATH: Record<string, string> = {
  admin: "/admin/varslinger",
  teacher: "/larer/varslinger",
  student: "/elev/varslinger",
  parent: "/foresatt/varslinger",
};

export function NotificationCenter() {
  const { notifications } = useNotifications();
  const { user } = useAuth();
  if (!user) return null;
  const mine = notifications.filter((n) => n.recipientId === user.id || (user.role === "admin"));
  const unread = mine.filter((n) => !n.read).length;
  const planned = mine.filter((n) => n.status === "Planlagt").length;
  const failed = mine.filter((n) => n.status === "Feilet").length;
  const compliance = mine.filter((n) => ["tsk_report_failed", "backup_signature_required", "teacher_approval_expiring", "step_blocked"].includes(n.trigger)).length;
  const recent = mine.slice(0, 6);
  const path = ROLE_PATH[user.role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-md hover:bg-accent transition-colors" aria-label="Varslinger">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm">Varslingssenter</div>
            <Link to={path} className="text-xs text-primary hover:underline">Åpne alle</Link>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-3 text-center">
            <Stat icon={<MailWarning className="size-3.5" />} label="Ulest" value={unread} />
            <Stat icon={<Clock className="size-3.5" />} label="Planlagt" value={planned} />
            <Stat icon={<AlertTriangle className="size-3.5" />} label="Feilet" value={failed} tone="destructive" />
            <Stat icon={<ShieldAlert className="size-3.5" />} label="Compliance" value={compliance} tone="warning" />
          </div>
        </div>
        <div className="max-h-[380px] overflow-y-auto">
          {recent.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Ingen varslinger</div>
          ) : recent.map((n) => (
            <Link key={n.id} to={path} className={`block px-4 py-3 border-b border-border last:border-0 hover:bg-accent transition-colors ${!n.read ? "bg-primary/5" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground">{CHANNEL_LABEL[n.channel]}</span>
                <span className={`text-[10px] font-semibold ${n.status === "Feilet" ? "text-destructive" : n.status === "Levert" ? "text-success" : n.status === "Planlagt" ? "text-info" : ""}`}>{n.status}</span>
              </div>
              <div className="text-xs font-medium mt-0.5 line-clamp-2">{n.message}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{n.recipientName} · {new Date(n.createdAt).toLocaleString("nb-NO")}</div>
            </Link>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-border bg-muted/40">
          <div className="text-[10px] text-muted-foreground italic">Prototypevisning: Meldinger sendes ikke i denne versjonen.</div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone?: "destructive" | "warning" }) {
  return (
    <div className={`rounded-md p-1.5 ${tone === "destructive" && value > 0 ? "bg-destructive/10" : tone === "warning" && value > 0 ? "bg-warning/10" : "bg-muted/50"}`}>
      <div className={`flex items-center justify-center gap-1 text-[10px] font-semibold ${tone === "destructive" && value > 0 ? "text-destructive" : tone === "warning" && value > 0 ? "text-warning-foreground" : "text-muted-foreground"}`}>
        {icon}{label}
      </div>
      <div className="text-base font-bold">{value}</div>
    </div>
  );
}
