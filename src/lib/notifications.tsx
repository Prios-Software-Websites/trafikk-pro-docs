// Frontend-only notification store. NO real messages are sent.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { students, teachers, getStudent, getTeacher } from "./mock-data";

export type Channel = "app" | "sms" | "email";
export type NotifStatus = "Planlagt" | "Sendt" | "Levert" | "Feilet" | "Venter";
export type NotifKind = "formal" | "informal";
export type RecipientRole = "admin" | "teacher" | "student" | "parent";

export type TriggerEvent =
  | "booking_confirmed"
  | "reminder_24h"
  | "reminder_2h"
  | "booking_changed"
  | "lesson_cancelled_student"
  | "late_cancel_fee"
  | "low_balance"
  | "payment_reminder"
  | "payment_confirmed"
  | "mandatory_completed"
  | "guidance_completed"
  | "step_blocked"
  | "teacher_approval_expiring"
  | "backup_signature_required"
  | "tsk_report_failed"
  | "custom_sms";

export const TRIGGER_LABELS: Record<TriggerEvent, string> = {
  booking_confirmed: "Bookingbekreftelse",
  reminder_24h: "Påminnelse 24 t",
  reminder_2h: "Påminnelse 2 t",
  booking_changed: "Booking endret av lærer",
  lesson_cancelled_student: "Avbestilt av elev",
  late_cancel_fee: "Sen avbestilling — gebyr",
  low_balance: "Lav saldo",
  payment_reminder: "Betalingspåminnelse",
  payment_confirmed: "Betaling bekreftet",
  mandatory_completed: "Obligatorisk opplæring fullført",
  guidance_completed: "Veiledningstime fullført",
  step_blocked: "Trinn blokkert — manglende dokumentasjon",
  teacher_approval_expiring: "Lærergodkjenning utløper snart",
  backup_signature_required: "Månedlig backup må signeres",
  tsk_report_failed: "TSK-rapportering feilet — manuell oppfølging",
  custom_sms: "Egendefinert melding (SMS)",
};

export type NotificationItem = {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientRole: RecipientRole;
  channel: Channel;
  contact: string; // masked phone or email
  trigger: TriggerEvent;
  message: string;
  studentId?: string;
  bookingRef?: string;
  trainingElement?: string;
  createdAt: string;
  scheduledAt: string;
  status: NotifStatus;
  read: boolean;
  kind: NotifKind;
  attempts: number;
};

export type Preferences = {
  app: boolean;
  sms: boolean;
  email: boolean;
  preferred: Channel;
};

const TEMPLATES: Partial<Record<TriggerEvent, string>> = {
  booking_confirmed: "Hei {elevnavn}. Du har kjøretime med {lærernavn} {dato} kl. {tid}. Husk å møte presis.",
  reminder_24h: "Hei {elevnavn}. Påminnelse: kjøretime i morgen {dato} kl. {tid} med {lærernavn}.",
  reminder_2h: "Hei {elevnavn}. Kjøretime om 2 timer ({tid}) med {lærernavn}.",
  booking_changed: "Kjøretimen din er endret. Ny tid: {dato} kl. {tid}. Se detaljer i appen.",
  lesson_cancelled_student: "Eleven {elevnavn} har avbestilt time {dato} kl. {tid}.",
  late_cancel_fee: "Sen avbestilling registrert. Gebyr på {beløp} kr påløper.",
  low_balance: "Du har lav saldo hos trafikkskolen. Fyll på saldo før ny booking.",
  payment_reminder: "Faktura forfaller {dato}. Vennligst betal i appen.",
  payment_confirmed: "Vi har mottatt betaling på {beløp} kr. Saldo er oppdatert.",
  mandatory_completed: "Obligatorisk opplæring er registrert og attestert av trafikklærer.",
  guidance_completed: "Veiledningstime er gjennomført og signert.",
  step_blocked: "Neste trinn er blokkert. Manglende dokumentasjon: {element}.",
  teacher_approval_expiring: "Din godkjenning for klasse {klasse} utløper {dato}. Forny snarest.",
  backup_signature_required: "Månedlig backup må signeres av faglig leder.",
  tsk_report_failed: "Rapportering til TSK feilet og krever manuell oppfølging.",
  custom_sms: "{tekst}",
};

export function renderTemplate(t: TriggerEvent, vars: Record<string, string | number | undefined>): string {
  let s = TEMPLATES[t] ?? TRIGGER_LABELS[t];
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v ?? "—"));
  }
  return s;
}

const FORMAL: TriggerEvent[] = [
  "booking_confirmed", "reminder_24h", "reminder_2h", "booking_changed",
  "lesson_cancelled_student", "late_cancel_fee", "low_balance", "payment_reminder",
  "payment_confirmed", "mandatory_completed", "guidance_completed", "step_blocked",
  "teacher_approval_expiring", "backup_signature_required", "tsk_report_failed",
];

function maskEmail(e: string) {
  const [u, d] = e.split("@");
  if (!u || !d) return e;
  return `${u.slice(0, 2)}***@${d}`;
}
function maskPhone(p: string) {
  return p.replace(/(\d{2})\s?\d{4}\s?(\d{2})/, "$1 ** ** $2");
}

const PHONES: Record<string, string> = {
  "u-admin": "97 12 34 56",
  "t-001": "98 22 11 33",
  "t-002": "98 22 11 44",
  "t-003": "98 22 11 55",
  "s-001": "91 11 22 33",
  "s-002": "91 22 33 44",
  "s-004": "91 33 44 55",
  "s-005": "91 44 55 66",
  "p-001": "92 11 22 33",
};

const DEFAULT_PREFS: Record<RecipientRole, Preferences> = {
  admin: { app: true, sms: false, email: true, preferred: "email" },
  teacher: { app: true, sms: true, email: true, preferred: "app" },
  student: { app: true, sms: true, email: false, preferred: "sms" },
  parent: { app: false, sms: true, email: true, preferred: "sms" },
};

function recipientInfo(id: string): { name: string; role: RecipientRole; email: string; phone: string } | null {
  const s = getStudent(id);
  if (s) return { name: s.name, role: "student", email: `${s.name.split(" ")[0].toLowerCase()}@example.com`, phone: PHONES[id] ?? "90 00 00 00" };
  const t = getTeacher(id);
  if (t) return { name: t.name, role: "teacher", email: t.email, phone: PHONES[id] ?? "90 00 00 00" };
  if (id === "u-admin") return { name: "Anders Johansen", role: "admin", email: "anders@oslotrafikkskole.no", phone: PHONES[id] };
  if (id === "p-001") return { name: "Kari Johansen", role: "parent", email: "kari@example.com", phone: PHONES[id] };
  return null;
}

const SEED: NotificationItem[] = [
  mk("seed-1", "s-001", "booking_confirmed", { elevnavn: "Magnus", lærernavn: "Erik Stenberg", dato: "2026-05-14", tid: "15:00" }, { studentId: "s-001", bookingRef: "BK-2026-0512-01", channelOverride: "sms", status: "Levert", offsetMin: -2880 }),
  mk("seed-2", "s-001", "reminder_24h", { elevnavn: "Magnus", lærernavn: "Erik Stenberg", dato: "2026-05-13", tid: "15:00" }, { studentId: "s-001", bookingRef: "BK-2026-0512-01", channelOverride: "app", status: "Sendt", offsetMin: -1440 }),
  mk("seed-3", "u-admin", "tsk_report_failed", {}, { studentId: "s-005", trainingElement: "Sikkerhetskurs på bane", channelOverride: "email", status: "Sendt", offsetMin: -120 }),
  mk("seed-4", "u-admin", "backup_signature_required", {}, { channelOverride: "email", status: "Planlagt", offsetMin: 60 }),
  mk("seed-5", "s-002", "low_balance", {}, { studentId: "s-002", channelOverride: "sms", status: "Feilet", offsetMin: -30 }),
  mk("seed-6", "p-001", "booking_confirmed", { elevnavn: "Magnus", lærernavn: "Erik Stenberg", dato: "2026-05-14", tid: "15:00" }, { studentId: "s-001", bookingRef: "BK-2026-0512-01", channelOverride: "email", status: "Levert", offsetMin: -2880 }),
  mk("seed-7", "t-002", "teacher_approval_expiring", { klasse: "A", dato: "2026-08-01" }, { channelOverride: "email", status: "Levert", offsetMin: -4320 }),
];

function mk(
  id: string,
  recipientId: string,
  trigger: TriggerEvent,
  vars: Record<string, string | number>,
  opts: { studentId?: string; bookingRef?: string; trainingElement?: string; channelOverride?: Channel; status?: NotifStatus; offsetMin?: number } = {},
): NotificationItem {
  const info = recipientInfo(recipientId)!;
  const channel = opts.channelOverride ?? DEFAULT_PREFS[info.role].preferred;
  const now = Date.now() + (opts.offsetMin ?? 0) * 60000;
  return {
    id,
    recipientId,
    recipientName: info.name,
    recipientRole: info.role,
    channel,
    contact: channel === "email" ? maskEmail(info.email) : channel === "sms" ? maskPhone(info.phone) : "App-innboks",
    trigger,
    message: renderTemplate(trigger, vars),
    studentId: opts.studentId,
    bookingRef: opts.bookingRef,
    trainingElement: opts.trainingElement,
    createdAt: new Date(now).toISOString(),
    scheduledAt: new Date(now + 1000 * 60).toISOString(),
    status: opts.status ?? "Planlagt",
    read: false,
    kind: FORMAL.includes(trigger) ? "formal" : "informal",
    attempts: opts.status === "Feilet" ? 2 : opts.status === "Sendt" || opts.status === "Levert" ? 1 : 0,
  };
}

type CreateInput = {
  recipientId: string;
  trigger: TriggerEvent;
  vars?: Record<string, string | number>;
  studentId?: string;
  bookingRef?: string;
  trainingElement?: string;
  scheduledInMin?: number;
  forceFail?: boolean;
};

type Ctx = {
  notifications: NotificationItem[];
  prefs: Record<RecipientRole, Preferences>;
  setPrefs: (role: RecipientRole, p: Preferences) => void;
  create: (input: CreateInput) => void;
  retry: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
};

const NotifCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "tdp_notifications_v1";
const PREFS_KEY = "tdp_notif_prefs_v1";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED);
  const [prefs, setPrefsState] = useState<Record<RecipientRole, Preferences>>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setNotifications(JSON.parse(raw));
      const p = localStorage.getItem(PREFS_KEY);
      if (p) setPrefsState(JSON.parse(p));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)); } catch {}
  }, [notifications]);

  const setPrefs = (role: RecipientRole, p: Preferences) => {
    setPrefsState((prev) => {
      const next = { ...prev, [role]: p };
      try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const create = (input: CreateInput) => {
    const info = recipientInfo(input.recipientId);
    if (!info) return;
    const pref = prefs[info.role];
    let channel: Channel = pref.preferred;
    if (channel === "app" && !pref.app) channel = pref.sms ? "sms" : pref.email ? "email" : "app";
    if (channel === "sms" && !pref.sms) channel = pref.app ? "app" : pref.email ? "email" : "sms";
    if (channel === "email" && !pref.email) channel = pref.app ? "app" : pref.sms ? "sms" : "email";

    const now = Date.now();
    const scheduledAt = new Date(now + (input.scheduledInMin ?? 0) * 60000).toISOString();
    const status: NotifStatus = input.forceFail ? "Feilet" : (input.scheduledInMin ?? 0) > 1 ? "Planlagt" : "Sendt";
    const item: NotificationItem = {
      id: `n-${now}-${Math.random().toString(36).slice(2, 7)}`,
      recipientId: input.recipientId,
      recipientName: info.name,
      recipientRole: info.role,
      channel,
      contact: channel === "email" ? maskEmail(info.email) : channel === "sms" ? maskPhone(info.phone) : "App-innboks",
      trigger: input.trigger,
      message: renderTemplate(input.trigger, input.vars ?? {}),
      studentId: input.studentId,
      bookingRef: input.bookingRef,
      trainingElement: input.trainingElement,
      createdAt: new Date(now).toISOString(),
      scheduledAt,
      status,
      read: false,
      kind: FORMAL.includes(input.trigger) ? "formal" : "informal",
      attempts: status === "Feilet" ? 1 : status === "Sendt" ? 1 : 0,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const retry = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, status: Math.random() > 0.2 ? "Levert" : "Sendt", attempts: n.attempts + 1 } : n));
  };
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearAll = () => setNotifications([]);

  const value = useMemo(() => ({ notifications, prefs, setPrefs, create, retry, markRead, markAllRead, clearAll }), [notifications, prefs]);
  return <NotifCtx.Provider value={value}>{children}</NotifCtx.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotifCtx);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}

export const CHANNEL_LABEL: Record<Channel, string> = { app: "App", sms: "SMS", email: "E-post" };

// Convenience: get all known recipients (for admin debugging)
export const ALL_RECIPIENTS = [
  { id: "u-admin", role: "admin" as const },
  ...teachers.map((t) => ({ id: t.id, role: "teacher" as const })),
  ...students.map((s) => ({ id: s.id, role: "student" as const })),
  { id: "p-001", role: "parent" as const },
];
