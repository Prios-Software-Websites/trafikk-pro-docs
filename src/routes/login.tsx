import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth, type Role } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CarFront, ShieldCheck, Lock, Smartphone } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Logg inn — Kjøreflyt" }] }),
  component: Login,
});

function Login() {
  const { setRole } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState<"role" | "2fa">("role");
  const [pending, setPending] = useState<Role | null>(null);

  const choose = (r: Role) => {
    setPending(r);
    setStep("2fa");
  };

  const finish = () => {
    if (!pending) return;
    setRole(pending);
    const home = pending === "admin" ? "/admin" : pending === "teacher" ? "/larer" : pending === "student" ? "/elev" : "/foresatt";
    navigate({ to: home });
  };

  const roles: { role: Role; sub: string }[] = [
    { role: "admin", sub: "Full tilgang til etterlevelse, rapportering, lærergodkjenninger og tilsyn." },
    { role: "teacher", sub: "Min dag, attestering, veiledningstimer og kommunikasjon med elever." },
    { role: "student", sub: "Progresjon, opplæringskort, booking, betaling og øvingskjøring." },
    { role: "parent", sub: "Innsyn i progresjon, betaling og privat øvingskjøring." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-md bg-primary grid place-items-center"><CarFront className="size-4 text-primary-foreground" /></div>
          <div className="leading-tight">
            <div className="font-bold tracking-tight text-lg">Kjøreflyt</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Et samarbeid mellom Prios og TA-Lappen</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 pr-3 border-r border-border">
            <img src={priosLogo} alt="Prios" className="h-6 w-auto object-contain" />
            <img src={taLappenLogo} alt="TA-Lappen" className="h-6 w-auto object-contain" />
          </div>
          <Button variant="outline" size="sm" onClick={() => setLang(lang === "nb" ? "en" : "nb")}>
            {lang === "nb" ? "English" : "Norsk Bokmål"}
          </Button>
        </div>
      </header>

      <div className="flex-1 grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center px-12 bg-gradient-to-br from-primary/95 to-primary text-primary-foreground">
          <div className="max-w-md">
            <div className="text-[11px] font-bold uppercase tracking-widest opacity-80 mb-4">Et samarbeid mellom Prios og TA-Lappen</div>
            <h1 className="text-4xl font-bold tracking-tight leading-tight text-balance">
              Administrasjons- og bookingsløsning for trafikkskoler.
            </h1>
            <p className="mt-4 text-primary-foreground/85 leading-relaxed">
              Bygget på logikken i Forskrift om trafikkopplæring. Hindrer vanlige avvik gjennom validering, rollebasert tilgang og umiddelbar tilsynsvisning.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 text-sm">
              <Feature icon={<ShieldCheck className="size-4" />} label="Sikker innlogging (mock BankID)" />
              <Feature icon={<Lock className="size-4" />} label="Rollebasert tilgang" />
              <Feature icon={<Smartphone className="size-4" />} label="Mobiloptimalisert for lærer" />
              <Feature icon={<CarFront className="size-4" />} label="TSK-rapportering (mock)" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {step === "role" ? (
              <>
                <h2 className="text-2xl font-bold tracking-tight">{t("login_title")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("login_sub")}</p>
                <div className="mt-6 space-y-3">
                  {roles.map(({ role, sub }) => (
                    <button
                      key={role}
                      onClick={() => choose(role)}
                      className="w-full text-left p-4 rounded-lg border border-border bg-card hover:border-primary hover:shadow-sm transition group"
                    >
                      <div className="font-semibold text-sm">{t(`role_${role}`)}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
                    </button>
                  ))}
                </div>
                <p className="mt-6 text-[11px] text-muted-foreground">
                  Demo-prototype. Ingen ekte BankID, Vipps eller Statens vegvesen-integrasjon.
                </p>
              </>
            ) : (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-info uppercase tracking-wider">
                  <ShieldCheck className="size-4" /> {t("login_method")}
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{t("login_continue")} {t(`role_${pending}`)}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t("login_2fa")}</p>
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="aspect-[3/2] grid place-items-center border border-border rounded-md text-lg font-mono bg-muted">•</div>
                  ))}
                </div>
                <Button className="w-full mt-6" onClick={finish}>{t("login_bankid")}</Button>
                <button onClick={() => setStep("role")} className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground">
                  ← Tilbake
                </button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="size-7 rounded bg-white/15 grid place-items-center">{icon}</div>
      <span className="opacity-90">{label}</span>
    </div>
  );
}
