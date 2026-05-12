import { useState } from "react";
import { PageHeader, StatCard, StatusBadge } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNotifications, CHANNEL_LABEL, TRIGGER_LABELS, type Channel, type NotifStatus, type RecipientRole } from "@/lib/notifications";
import { useAuth } from "@/lib/auth";
import { getStudent } from "@/lib/mock-data";
import { AlertTriangle, Smartphone, MessageSquare, Mail, RotateCw, Info } from "lucide-react";
import { toast } from "sonner";

const channelIcon = { app: Smartphone, sms: MessageSquare, email: Mail } as const;
const STATUSES: NotifStatus[] = ["Planlagt", "Sendt", "Levert", "Feilet", "Venter"];

export function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, prefs, setPrefs, retry, markAllRead } = useNotifications();
  const [filterStatus, setFilterStatus] = useState<NotifStatus | "all">("all");
  const [filterChannel, setFilterChannel] = useState<Channel | "all">("all");

  if (!user) return null;
  const isAdmin = user.role === "admin";

  // Admin ser alt; andre ser kun egne
  const visible = notifications.filter((n) => isAdmin || n.recipientId === user.id);
  const formal = visible.filter((n) => n.kind === "formal");
  const filtered = formal.filter((n) =>
    (filterStatus === "all" || n.status === filterStatus) &&
    (filterChannel === "all" || n.channel === filterChannel),
  );

  const myPrefs = prefs[user.role];
  const failedCount = visible.filter((n) => n.status === "Feilet").length;
  const plannedCount = visible.filter((n) => n.status === "Planlagt").length;
  const sentCount = visible.filter((n) => n.status === "Sendt" || n.status === "Levert").length;

  return (
    <>
      <PageHeader
        title="Kommunikasjon og varslinger"
        description="Sentralisert oversikt over systemvarsler, kanaler og preferanser. Formelle varsler arkiveres for dokumentasjon."
        actions={<Button variant="outline" onClick={() => { markAllRead(); toast.success("Alle markert som lest"); }}>Marker alle som lest</Button>}
      />

      <div className="mb-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
        <Info className="size-4 text-warning-foreground shrink-0 mt-0.5" />
        <span><strong>Prototypevisning:</strong> Meldinger sendes ikke i denne versjonen. Alle SMS, e-post og app-varsler er simulerte for demonstrasjon.</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Sendt / Levert" value={sentCount} tone="success" />
        <StatCard label="Planlagt" value={plannedCount} tone="info" />
        <StatCard label="Feilet" value={failedCount} tone={failedCount > 0 ? "destructive" : "muted"} />
        <StatCard label="Totalt synlig" value={visible.length} />
      </div>

      <Tabs defaultValue="log" className="space-y-4">
        <TabsList>
          <TabsTrigger value="log">Varslingslogg</TabsTrigger>
          <TabsTrigger value="prefs">Preferanser</TabsTrigger>
          <TabsTrigger value="templates">Maler</TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-4">
          <Card className="p-4 flex flex-wrap items-center gap-3">
            <div className="text-xs font-semibold text-muted-foreground">Filter:</div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as NotifStatus | "all")}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statuser</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterChannel} onValueChange={(v) => setFilterChannel(v as Channel | "all")}>
              <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Kanal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle kanaler</SelectItem>
                <SelectItem value="app">App</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">E-post</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto text-xs text-muted-foreground">{filtered.length} av {formal.length} formelle varsler</div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Mottaker</th>
                    <th className="text-left px-4 py-3 font-semibold">Kanal</th>
                    <th className="text-left px-4 py-3 font-semibold">Kontakt</th>
                    <th className="text-left px-4 py-3 font-semibold">Trigger / Melding</th>
                    <th className="text-left px-4 py-3 font-semibold">Relatert</th>
                    <th className="text-left px-4 py-3 font-semibold">Tidspunkt</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-right px-4 py-3 font-semibold">Handling</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-sm">Ingen varsler matcher filteret.</td></tr>
                  )}
                  {filtered.map((n) => {
                    const Icon = channelIcon[n.channel];
                    const tone: "success" | "warning" | "destructive" | "info" | "muted" =
                      n.status === "Feilet" ? "destructive" :
                      n.status === "Levert" ? "success" :
                      n.status === "Sendt" ? "info" :
                      n.status === "Planlagt" ? "warning" : "muted";
                    const student = n.studentId ? getStudent(n.studentId) : null;
                    return (
                      <tr key={n.id} className={!n.read ? "bg-primary/5" : ""}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{n.recipientName}</div>
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{roleLabel(n.recipientRole)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold"><Icon className="size-3.5" /> {CHANNEL_LABEL[n.channel]}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{n.contact}</td>
                        <td className="px-4 py-3 max-w-sm">
                          <div className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground">{TRIGGER_LABELS[n.trigger]}</div>
                          <div className="text-xs mt-0.5 line-clamp-2">{n.message}</div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {student && <div>{student.name}</div>}
                          {n.bookingRef && <div className="font-mono text-[10px] text-muted-foreground">{n.bookingRef}</div>}
                          {n.trainingElement && <div className="text-muted-foreground">{n.trainingElement}</div>}
                          {!student && !n.bookingRef && !n.trainingElement && <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div>Opprettet: {new Date(n.createdAt).toLocaleString("nb-NO")}</div>
                          <div className="text-muted-foreground">Planlagt: {new Date(n.scheduledAt).toLocaleString("nb-NO")}</div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge tone={tone}>{n.status}</StatusBadge>
                          {n.attempts > 0 && <div className="text-[10px] text-muted-foreground mt-1">Forsøk: {n.attempts}</div>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {n.status === "Feilet" ? (
                            <Button size="sm" variant="outline" onClick={() => { retry(n.id); toast.success("Sender på nytt (mock)"); }}>
                              <RotateCw className="size-3" /> Prøv igjen
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {failedCount > 0 && (
            <Card className="p-4 border-destructive/40 bg-destructive/5">
              <div className="flex items-center gap-2 text-sm font-semibold text-destructive"><AlertTriangle className="size-4" /> {failedCount} feilede varsler krever oppfølging</div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="prefs">
          <Card className="p-6 max-w-2xl">
            <div className="font-semibold mb-1">Mine varslingspreferanser</div>
            <div className="text-xs text-muted-foreground mb-5">Velg hvordan du vil motta systemvarsler. Endringer er kun for prototypen.</div>
            <div className="space-y-4">
              <PrefRow label="App-varsel" hint="Mottatt i appens varslingssenter" checked={myPrefs.app} onChange={(v) => setPrefs(user.role, { ...myPrefs, app: v })} />
              <PrefRow label="SMS" hint="Sendt til registrert mobilnummer" checked={myPrefs.sms} onChange={(v) => setPrefs(user.role, { ...myPrefs, sms: v })} />
              <PrefRow label="E-post" hint="Sendt til registrert e-postadresse" checked={myPrefs.email} onChange={(v) => setPrefs(user.role, { ...myPrefs, email: v })} />
              <div className="border-t pt-4">
                <div className="text-sm font-semibold mb-2">Foretrukket kanal</div>
                <Select value={myPrefs.preferred} onValueChange={(v) => setPrefs(user.role, { ...myPrefs, preferred: v as Channel })}>
                  <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="app">App-varsel</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">E-post</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">Brukes som primærkanal når flere er aktive.</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-muted/40 text-sm font-semibold">Forhåndsdefinerte maler (Bokmål)</div>
            <ul className="divide-y divide-border">
              {Object.entries({
                booking_confirmed: "Hei {elevnavn}. Du har kjøretime med {lærernavn} {dato} kl. {tid}. Husk å møte presis.",
                booking_changed: "Kjøretimen din er endret. Ny tid: {dato} kl. {tid}. Se detaljer i appen.",
                low_balance: "Du har lav saldo hos trafikkskolen. Fyll på saldo før ny booking.",
                mandatory_completed: "Obligatorisk opplæring er registrert og attestert av trafikklærer.",
                tsk_report_failed: "Rapportering til TSK feilet og krever manuell oppfølging.",
                backup_signature_required: "Månedlig backup må signeres av faglig leder.",
              }).map(([k, v]) => (
                <li key={k} className="px-5 py-3">
                  <div className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground">{TRIGGER_LABELS[k as keyof typeof TRIGGER_LABELS]}</div>
                  <div className="text-sm mt-1 font-mono">{v}</div>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function PrefRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{hint}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function roleLabel(r: RecipientRole) {
  return r === "admin" ? "Administrator" : r === "teacher" ? "Trafikklærer" : r === "student" ? "Elev" : "Foresatt";
}
