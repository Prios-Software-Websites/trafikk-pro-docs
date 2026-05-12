import { useMemo, useState } from "react";
import { useAuth, type Role } from "@/lib/auth";
import { useNotifications, CHANNEL_LABEL, type TriggerEvent, type Channel } from "@/lib/notifications";
import { students, teachers, getStudent, getTeacher } from "@/lib/mock-data";
import { PageHeader } from "@/components/Status";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Signal, Battery, Wifi, MessageSquareText, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

type Recipient = { id: string; name: string; role: "admin" | "teacher" | "student" | "parent"; phone: string };

const PHONES: Record<string, string> = {
  "u-admin": "97 12 34 56",
  "t-001": "98 22 11 33", "t-002": "98 22 11 44", "t-003": "98 22 11 55",
  "s-001": "91 11 22 33", "s-002": "91 22 33 44", "s-004": "91 33 44 55", "s-005": "91 44 55 66",
  "p-001": "92 11 22 33",
};

function maskPhone(p: string) { return p.replace(/(\d{2})\s?\d{4}\s?(\d{2})/, "$1 ** ** $2"); }

function getRecipientsForRole(role: Role): Recipient[] {
  const teacherRecipients: Recipient[] = teachers.map((t) => ({ id: t.id, name: t.name, role: "teacher" as const, phone: PHONES[t.id] ?? "90 00 00 00" }));
  const studentRecipients: Recipient[] = students.map((s) => ({ id: s.id, name: s.name, role: "student" as const, phone: PHONES[s.id] ?? "90 00 00 00" }));
  const parentRecipient: Recipient = { id: "p-001", name: "Kari Johansen (foresatt)", role: "parent", phone: PHONES["p-001"] };
  const admin: Recipient = { id: "u-admin", name: "Anders Johansen (faglig leder)", role: "admin", phone: PHONES["u-admin"] };

  if (role === "admin") return [...studentRecipients, ...teacherRecipients, parentRecipient];
  if (role === "teacher") return [...studentRecipients, parentRecipient, admin];
  if (role === "student") return [...teacherRecipients, admin];
  // parent
  return [...teacherRecipients, admin];
}

type Template = { label: string; trigger: TriggerEvent; render: (sender: string) => string };

function templatesForRole(role: Role, recipientName: string, senderName: string): Template[] {
  const first = (n: string) => n.split(" ")[0];
  if (role === "admin") return [
    { label: "Generell info", trigger: "custom_sms", render: () => `Hei ${first(recipientName)}. Dette er ${senderName} fra Oslo Trafikkskole. Vennligst ta kontakt ved spørsmål.` },
    { label: "Påminnelse betaling", trigger: "payment_reminder", render: () => `Hei ${first(recipientName)}. Faktura forfaller om 3 dager. Vennligst betal i appen.` },
    { label: "Kvelds-stenging", trigger: "custom_sms", render: () => `Skolen er stengt mandag pga. fagdag. Bookede timer flyttes — sjekk appen.` },
  ];
  if (role === "teacher") return [
    { label: "Bekrefte time i morgen", trigger: "custom_sms", render: () => `Hei ${first(recipientName)}! Vi sees i morgen til kjøretime. Møt 5 min før. Mvh ${senderName}.` },
    { label: "Forsinket — flytter 15 min", trigger: "custom_sms", render: () => `Hei ${first(recipientName)}, jeg blir 15 min forsinket. Vi starter 15 min senere. Beklager! ${senderName}` },
    { label: "Hentested endret", trigger: "custom_sms", render: () => `Hei ${first(recipientName)}. Vi møtes ved Storo i morgen i stedet for skolen. Mvh ${senderName}.` },
  ];
  if (role === "student") return [
    { label: "Spør om ledige timer", trigger: "custom_sms", render: () => `Hei ${first(recipientName)}, har du noen ledige timer neste uke? Hilsen ${senderName}.` },
    { label: "Kan ikke møte i morgen", trigger: "custom_sms", render: () => `Hei, jeg blir dessverre syk og må melde avbud til timen i morgen. Beklager! ${senderName}` },
    { label: "Bekrefter oppmøte", trigger: "custom_sms", render: () => `Hei ${first(recipientName)}, bekrefter at jeg møter til timen som avtalt. ${senderName}` },
  ];
  // parent
  return [
    { label: "Gi beskjed om henting", trigger: "custom_sms", render: () => `Hei ${first(recipientName)}, jeg henter ${senderName === "Kari Johansen" ? "Magnus" : "eleven"} etter timen i dag. Mvh ${senderName}.` },
    { label: "Spør om fremgang", trigger: "custom_sms", render: () => `Hei ${first(recipientName)}, kan du oppdatere meg på fremgangen? Mvh ${senderName}.` },
  ];
}

export function SmsComposer() {
  const { user } = useAuth();
  const { create, notifications } = useNotifications();
  if (!user) return null;

  const recipients = useMemo(() => getRecipientsForRole(user.role), [user.role]);
  const [recipientId, setRecipientId] = useState<string>(recipients[0]?.id ?? "");
  const recipient = recipients.find((r) => r.id === recipientId);
  const templates = useMemo(() => recipient ? templatesForRole(user.role, recipient.name, user.name) : [], [user, recipient]);
  const [text, setText] = useState<string>(templates[0]?.render(user.name) ?? "");
  const [sending, setSending] = useState(false);

  // Last sent SMS to this recipient (for preview)
  const lastSent = notifications.find((n) => n.recipientId === recipientId && n.channel === "sms");

  const charCount = text.length;
  const segments = Math.max(1, Math.ceil(charCount / 160));
  const remaining = segments * 160 - charCount;

  const onSelectTemplate = (idx: string) => {
    const t = templates[Number(idx)];
    if (t) setText(t.render(user.name));
  };

  const handleSend = (forceFail = false) => {
    if (!recipient || !text.trim()) return;
    setSending(true);
    setTimeout(() => {
      create({
        recipientId: recipient.id,
        trigger: "custom_sms",
        vars: { tekst: text },
        channelOverride: "sms",
        forceFail,
      });
      toast[forceFail ? "error" : "success"](
        forceFail ? "Mock: SMS feilet" : "Mock: SMS sendt",
        { description: `Til ${recipient.name} (${maskPhone(recipient.phone)}). Ingen reell SMS er sendt.` },
      );
      setSending(false);
    }, 600);
  };

  return (
    <>
      <PageHeader
        title="Send SMS (mock)"
        description="Demonstrerer hvordan SMS-flyten ser ut for innlogget bruker. Ingen reelle meldinger sendes — alt logges i varslingssenteret."
      />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Composer */}
        <Card className="p-5 space-y-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Avsender</div>
              <div className="font-semibold mt-1">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.role} · Trafikkskole-app</div>
            </div>
            <Badge variant="outline" className="gap-1.5"><MessageSquareText className="size-3" /> Kanal: SMS</Badge>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Mottaker</label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {recipients.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} <span className="text-muted-foreground ml-1">· {maskPhone(r.phone)}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {recipient && (
              <div className="text-[11px] text-muted-foreground mt-1.5">
                Personvern: telefonnummer maskes i loggen som <span className="font-mono">{maskPhone(recipient.phone)}</span>.
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Maler</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {templates.map((t, i) => (
                <Button key={i} size="sm" variant="outline" onClick={() => onSelectTemplate(String(i))}>
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Melding</label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="mt-1.5 font-medium" placeholder="Skriv en kort melding…" />
            <div className="flex items-center justify-between mt-1.5 text-[11px] text-muted-foreground">
              <span>{charCount} tegn · {segments} SMS-segment{segments > 1 ? "er" : ""} · {remaining} igjen</span>
              {charCount > 160 && <span className="text-warning-foreground">Lang melding splittes</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border">
            <Button onClick={() => handleSend(false)} disabled={sending || !text.trim()}>
              <Send className="size-4" /> {sending ? "Sender…" : "Send SMS (mock)"}
            </Button>
            <Button variant="outline" onClick={() => handleSend(true)} disabled={sending || !text.trim()}>
              <AlertCircle className="size-4" /> Simuler feilsending
            </Button>
            <span className="text-[11px] text-muted-foreground italic ml-auto">
              Prototypevisning — ingen reell SMS-leverandør tilkoblet.
            </span>
          </div>
        </Card>

        {/* Phone preview */}
        <div className="lg:sticky lg:top-20">
          <PhonePreview
            recipientName={recipient?.name ?? ""}
            senderName={user.name}
            text={text}
            sentAt={lastSent?.createdAt}
            status={lastSent?.status}
            channel="sms"
          />
          <div className="mt-3 text-[11px] text-muted-foreground text-center">Forhåndsvisning av hvordan meldingen vises på mottakerens telefon.</div>
        </div>
      </div>
    </>
  );
}

function PhonePreview({ recipientName, senderName, text, sentAt, status, channel }:
  { recipientName: string; senderName: string; text: string; sentAt?: string; status?: string; channel: Channel }) {
  const time = new Date().toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  return (
    <div className="mx-auto w-[300px] rounded-[2.5rem] bg-zinc-900 p-2 shadow-2xl">
      <div className="rounded-[2rem] bg-zinc-100 dark:bg-zinc-950 overflow-hidden border-[3px] border-zinc-800">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-3 pb-1 text-zinc-900 dark:text-zinc-100 text-[11px] font-semibold">
          <span>{time}</span>
          <div className="flex items-center gap-1">
            <Signal className="size-3" /><Wifi className="size-3" /><Battery className="size-3.5" />
          </div>
        </div>
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-300 dark:border-zinc-800 text-center">
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">{CHANNEL_LABEL[channel]}</div>
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{senderName || "Avsender"}</div>
          <div className="text-[10px] text-zinc-500">til {recipientName || "mottaker"}</div>
        </div>
        {/* Bubble */}
        <div className="p-4 min-h-[280px] bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
          <div className="text-center text-[10px] text-zinc-500 mb-3">I dag {time}</div>
          {text.trim() ? (
            <div className="max-w-[85%] ml-auto">
              <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-3.5 py-2.5 text-[13px] leading-snug shadow whitespace-pre-wrap break-words">
                {text}
              </div>
              <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-zinc-500">
                {sentAt ? (
                  <>
                    {status === "Levert" ? <CheckCircle2 className="size-3 text-success" /> :
                      status === "Feilet" ? <AlertCircle className="size-3 text-destructive" /> :
                      <Clock className="size-3" />}
                    <span>{status ?? "Sendt"}</span>
                  </>
                ) : (
                  <span className="italic">forhåndsvisning</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-zinc-400 mt-12">Skriv en melding for å se forhåndsvisning</div>
          )}
        </div>
        {/* Home indicator */}
        <div className="flex justify-center py-2 bg-zinc-100 dark:bg-zinc-950">
          <div className="w-24 h-1 rounded-full bg-zinc-400 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  );
}

// silence unused getStudent/getTeacher imports for tree-shake friendliness
void getStudent; void getTeacher;
