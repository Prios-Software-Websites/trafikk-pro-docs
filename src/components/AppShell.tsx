import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth, type Role } from "@/lib/auth";
import { useI18n, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Users, GraduationCap, Calendar, IdCard, ClipboardList, Eye,
  Send, Wallet, MessageSquare, Settings, ScrollText, LogOut, BookOpenCheck,
  CarFront, MapPinned, CreditCard, ChevronDown, ShieldCheck, BellRing, Smartphone,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NotificationCenter } from "@/components/NotificationCenter";

type Item = { to: string; key: string; icon: ReactNode };

const navByRole: Record<Role, Item[]> = {
  admin: [
    { to: "/admin", key: "nav_dashboard", icon: <LayoutDashboard className="size-4" /> },
    { to: "/admin/elever", key: "nav_register", icon: <ClipboardList className="size-4" /> },
    { to: "/admin/laerere", key: "nav_teachers", icon: <GraduationCap className="size-4" /> },
    { to: "/admin/kalender", key: "nav_calendar", icon: <Calendar className="size-4" /> },
    { to: "/admin/opplaeringskort", key: "nav_training_card", icon: <IdCard className="size-4" /> },
    { to: "/admin/tilsynsvisning", key: "nav_supervision", icon: <Eye className="size-4" /> },
    { to: "/admin/rapportering", key: "nav_reporting", icon: <Send className="size-4" /> },
    { to: "/admin/okonomi", key: "nav_economy", icon: <Wallet className="size-4" /> },
    { to: "/admin/meldinger", key: "nav_messages", icon: <MessageSquare className="size-4" /> },
    { to: "/admin/varslinger", key: "nav_notifications", icon: <BellRing className="size-4" /> },
    { to: "/admin/revisjonslogg", key: "nav_audit", icon: <ScrollText className="size-4" /> },
    { to: "/admin/innstillinger", key: "nav_settings", icon: <Settings className="size-4" /> },
  ],
  teacher: [
    { to: "/larer", key: "nav_my_day", icon: <LayoutDashboard className="size-4" /> },
    { to: "/larer/elever", key: "nav_my_students", icon: <Users className="size-4" /> },
    { to: "/larer/kalender", key: "nav_calendar", icon: <Calendar className="size-4" /> },
    { to: "/larer/attestering", key: "nav_attest", icon: <BookOpenCheck className="size-4" /> },
    { to: "/larer/veiledning", key: "nav_guidance", icon: <ClipboardList className="size-4" /> },
    { to: "/larer/meldinger", key: "nav_messages", icon: <MessageSquare className="size-4" /> },
    { to: "/larer/varslinger", key: "nav_notifications", icon: <BellRing className="size-4" /> },
  ],
  student: [
    { to: "/elev", key: "nav_progress", icon: <LayoutDashboard className="size-4" /> },
    { to: "/elev/book", key: "nav_book", icon: <Calendar className="size-4" /> },
    { to: "/elev/opplaeringskort", key: "nav_my_card", icon: <IdCard className="size-4" /> },
    { to: "/elev/ovingskjoring", key: "nav_practice", icon: <MapPinned className="size-4" /> },
    { to: "/elev/betaling", key: "nav_payment", icon: <CreditCard className="size-4" /> },
    { to: "/elev/meldinger", key: "nav_messages", icon: <MessageSquare className="size-4" /> },
    { to: "/elev/varslinger", key: "nav_notifications", icon: <BellRing className="size-4" /> },
  ],
  parent: [
    { to: "/foresatt", key: "nav_overview", icon: <LayoutDashboard className="size-4" /> },
    { to: "/foresatt/okonomi", key: "nav_economy", icon: <Wallet className="size-4" /> },
    { to: "/foresatt/ovingskjoring", key: "nav_practice", icon: <MapPinned className="size-4" /> },
    { to: "/foresatt/meldinger", key: "nav_messages", icon: <MessageSquare className="size-4" /> },
    { to: "/foresatt/varslinger", key: "nav_notifications", icon: <BellRing className="size-4" /> },
  ],
};

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut, setRole } = useAuth();
  const { t, lang, setLang } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;
  const items = navByRole[user.role];

  const handleRole = (r: Role) => {
    setRole(r);
    const home = r === "admin" ? "/admin" : r === "teacher" ? "/larer" : r === "student" ? "/elev" : "/foresatt";
    navigate({ to: home });
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="px-5 py-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-primary grid place-items-center">
              <CarFront className="size-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-tight">TrafikkDok.<span className="text-primary"> Pro</span></div>
              <div className="text-[10px] text-muted-foreground">{t("school_name")}</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {items.map((item) => {
            const active = pathname === item.to || (item.to !== "/admin" && item.to !== "/larer" && item.to !== "/elev" && item.to !== "/foresatt" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-primary font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                {item.icon}
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-sidebar-accent transition-colors text-left">
                <div className="size-8 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold">
                  {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{t(`role_${user.role}`)}</div>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t("switch_role")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleRole("admin")}>{t("role_admin")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRole("teacher")}>{t("role_teacher")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRole("student")}>{t("role_student")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRole("parent")}>{t("role_parent")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setLang("nb")}>Norsk Bokmål {lang === "nb" && "✓"}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("en")}>English {lang === "en" && "✓"}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { signOut(); navigate({ to: "/login" }); }}>
                <LogOut className="size-4 mr-2" /> {t("logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {open && <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 h-14 bg-card/90 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-2 rounded-md hover:bg-accent" onClick={() => setOpen(true)} aria-label="Meny">
              <span className="block w-5 h-px bg-foreground mb-1" />
              <span className="block w-5 h-px bg-foreground mb-1" />
              <span className="block w-5 h-px bg-foreground" />
            </button>
            <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-success" />
              <span>{t("rbac_active")} · {t("audit_active")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden md:inline text-[11px] font-medium px-2 py-0.5 rounded bg-success/10 text-success uppercase tracking-wide">
              System OK
            </span>
            <NotificationCenter />
            <Button size="sm" variant="outline" onClick={() => setLang(lang === "nb" ? "en" : "nb")}>
              {lang === "nb" ? "EN" : "NB"}
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
