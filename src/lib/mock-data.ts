// Mock data for Kjøreflyt prototype.
// All identifiers, names, and timestamps are fictional.

export type LicenseClass = "B" | "BE" | "A" | "A2" | "C" | "CE";

export type StepStatus = "locked" | "available" | "completed" | "needs_assessment" | "needs_reporting";

export type Trinn = {
  number: 1 | 2 | 3 | 4;
  title: string;
  status: StepStatus;
  required: string[]; // labels
  completed: string[];
};

export type Student = {
  id: string;
  studentNo: string; // sequential
  name: string;
  address: string;
  ssnMasked: string;
  startDate: string;
  endDate?: string;
  licenseClass: LicenseClass;
  status: "Aktiv" | "Arkivert" | "Pause";
  responsibleTeacherId: string;
  trinn: Trinn[];
  lessons: number;
  mandatoryDone: number;
  mandatoryTotal: number;
  docStatus: "Komplett" | "Mangler" | "Utløper";
  lastUpdated: string;
  balanceNok: number;
  parentId?: string;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  approvedClasses: LicenseClass[];
  approvalValidTo: string; // ISO
  firstAid: boolean;
  heavyVehicle: boolean;
  motorcycle: boolean;
  trackSafety: boolean;
  status: "Gyldig" | "Utløper snart" | "Utløpt" | "Mangler dokumentasjon";
};

export type Lesson = {
  id: string;
  studentId: string;
  teacherId: string;
  date: string;
  start: string; // HH:mm
  durationMin: number;
  type: "Ordinær" | "Obligatorisk" | "Veiledningstime";
  trinn: 1 | 2 | 3 | 4;
  attested: boolean;
  signature?: "Sikker PIN" | "Mock BankID" | "Mock Vipps";
  notes?: string;
};

export type ReportItem = {
  id: string;
  studentId: string;
  teacherId: string;
  element: string;
  classRef: LicenseClass;
  completedAt: string;
  status: "Klar for innsending" | "Sendt" | "Mottatt" | "Feilet" | "Krever manuell kontroll" | "Ikke rapporteringspliktig";
  attempts: number;
  apiMessage?: string;
};

export type AuditEntry = {
  id: string;
  ts: string;
  user: string;
  role: string;
  action: string;
  object: string;
  objectId: string;
  summary?: string;
  reason?: string;
  signature?: string;
};

export const teachers: Teacher[] = [
  { id: "t-001", name: "Erik Stenberg", email: "erik@oslotrafikkskole.no", approvedClasses: ["B", "BE"], approvalValidTo: "2027-04-12", firstAid: true, heavyVehicle: false, motorcycle: false, trackSafety: true, status: "Gyldig" },
  { id: "t-002", name: "Siri Nilsen", email: "siri@oslotrafikkskole.no", approvedClasses: ["B", "A", "A2"], approvalValidTo: "2026-08-01", firstAid: true, heavyVehicle: false, motorcycle: true, trackSafety: true, status: "Utløper snart" },
  { id: "t-003", name: "Hanne Kristiansen", email: "hanne@oslotrafikkskole.no", approvedClasses: ["B", "C", "CE"], approvalValidTo: "2024-11-01", firstAid: false, heavyVehicle: true, motorcycle: false, trackSafety: false, status: "Utløpt" },
];

const trinn = (overrides: Partial<Record<1 | 2 | 3 | 4, StepStatus>> = {}): Trinn[] => [
  {
    number: 1,
    title: "Trafikalt grunnkurs",
    status: overrides[1] ?? "completed",
    required: ["Mørkekjøring", "Førstehjelp", "Tema trafikk"],
    completed: ["Mørkekjøring", "Førstehjelp", "Tema trafikk"],
  },
  {
    number: 2,
    title: "Grunnleggende kjøretøy- og kjørekompetanse",
    status: overrides[2] ?? "completed",
    required: ["Kjøretøykontroll", "Veiledningstime 2.7"],
    completed: ["Kjøretøykontroll", "Veiledningstime 2.7"],
  },
  {
    number: 3,
    title: "Trafikal kompetanse",
    status: overrides[3] ?? "available",
    required: ["Trafikal opplæring", "Veiledningstime 3.7"],
    completed: ["Trafikal opplæring"],
  },
  {
    number: 4,
    title: "Avsluttende opplæring",
    status: overrides[4] ?? "locked",
    required: ["Sikkerhetskurs på bane", "Sikkerhetskurs på vei"],
    completed: [],
  },
];

export const students: Student[] = [
  {
    id: "s-001",
    studentNo: "2024-0412",
    name: "Magnus Johansen",
    address: "Storgata 14, 0184 Oslo",
    ssnMasked: "150603 *****",
    startDate: "2024-01-15",
    licenseClass: "B",
    status: "Aktiv",
    responsibleTeacherId: "t-001",
    trinn: trinn(),
    lessons: 22,
    mandatoryDone: 4,
    mandatoryTotal: 6,
    docStatus: "Komplett",
    lastUpdated: "2026-05-08",
    balanceNok: 3450,
    parentId: "p-001",
  },
  {
    id: "s-002",
    studentNo: "2024-0413",
    name: "Ingrid Bergfald",
    address: "Markveien 9, 0554 Oslo",
    ssnMasked: "220504 *****",
    startDate: "2024-02-02",
    licenseClass: "B",
    status: "Aktiv",
    responsibleTeacherId: "t-002",
    trinn: trinn({ 3: "needs_assessment" }),
    lessons: 18,
    mandatoryDone: 3,
    mandatoryTotal: 6,
    docStatus: "Mangler",
    lastUpdated: "2026-05-09",
    balanceNok: -1200,
  },
  {
    id: "s-003",
    studentNo: "2024-0414",
    name: "Lars Petterson",
    address: "Frognerveien 31, 0263 Oslo",
    ssnMasked: "111201 *****",
    startDate: "2023-09-10",
    endDate: "2024-08-22",
    licenseClass: "A",
    status: "Arkivert",
    responsibleTeacherId: "t-002",
    trinn: trinn({ 4: "completed" }),
    lessons: 30,
    mandatoryDone: 6,
    mandatoryTotal: 6,
    docStatus: "Komplett",
    lastUpdated: "2024-08-22",
    balanceNok: 0,
  },
  {
    id: "s-004",
    studentNo: "2024-0415",
    name: "Aisha Rahman",
    address: "Grünerløkka 12, 0552 Oslo",
    ssnMasked: "300705 *****",
    startDate: "2024-03-21",
    licenseClass: "B",
    status: "Aktiv",
    responsibleTeacherId: "t-001",
    trinn: trinn({ 2: "needs_reporting", 3: "locked", 4: "locked" }),
    lessons: 9,
    mandatoryDone: 2,
    mandatoryTotal: 6,
    docStatus: "Mangler",
    lastUpdated: "2026-05-10",
    balanceNok: 2100,
  },
  {
    id: "s-005",
    studentNo: "2024-0416",
    name: "Jonas Lie",
    address: "Bjølsenhagen 4, 0468 Oslo",
    ssnMasked: "180806 *****",
    startDate: "2024-04-05",
    licenseClass: "C",
    status: "Aktiv",
    responsibleTeacherId: "t-003",
    trinn: trinn({ 3: "needs_reporting" }),
    lessons: 14,
    mandatoryDone: 3,
    mandatoryTotal: 6,
    docStatus: "Utløper",
    lastUpdated: "2026-05-07",
    balanceNok: 800,
  },
];

export const lessons: Lesson[] = [
  { id: "l-1", studentId: "s-001", teacherId: "t-001", date: "2026-05-12", start: "08:00", durationMin: 90, type: "Ordinær", trinn: 3, attested: true, signature: "Sikker PIN" },
  { id: "l-2", studentId: "s-002", teacherId: "t-002", date: "2026-05-12", start: "10:00", durationMin: 45, type: "Veiledningstime", trinn: 3, attested: false },
  { id: "l-3", studentId: "s-004", teacherId: "t-001", date: "2026-05-12", start: "13:00", durationMin: 90, type: "Obligatorisk", trinn: 2, attested: true, signature: "Mock BankID" },
  { id: "l-4", studentId: "s-005", teacherId: "t-003", date: "2026-05-13", start: "09:00", durationMin: 90, type: "Obligatorisk", trinn: 3, attested: false },
  { id: "l-5", studentId: "s-001", teacherId: "t-001", date: "2026-05-14", start: "15:00", durationMin: 90, type: "Ordinær", trinn: 3, attested: false },
];

export const reports: ReportItem[] = [
  { id: "r-1", studentId: "s-004", teacherId: "t-001", element: "Veiledningstime 2.7", classRef: "B", completedAt: "2026-05-10T11:00", status: "Klar for innsending", attempts: 0 },
  { id: "r-2", studentId: "s-001", teacherId: "t-001", element: "Mørkekjøring", classRef: "B", completedAt: "2026-04-22T19:00", status: "Mottatt", attempts: 1, apiMessage: "OK_TSK_RECEIVED_2026" },
  { id: "r-3", studentId: "s-005", teacherId: "t-003", element: "Sikkerhetskurs på bane", classRef: "C", completedAt: "2026-05-08T10:00", status: "Feilet", attempts: 2, apiMessage: "ERR_INVALID_TEACHER_APPROVAL" },
  { id: "r-4", studentId: "s-002", teacherId: "t-002", element: "Veiledningstime 3.7", classRef: "B", completedAt: "2026-05-09T14:00", status: "Krever manuell kontroll", attempts: 1, apiMessage: "WARN_DURATION_MISMATCH" },
  { id: "r-5", studentId: "s-001", teacherId: "t-001", element: "Førstehjelp", classRef: "B", completedAt: "2026-04-15T10:00", status: "Sendt", attempts: 1 },
];

export const auditLog: AuditEntry[] = [
  { id: "a-1", ts: "2026-05-12T08:35", user: "Erik Stenberg", role: "Trafikklærer", action: "Attesterte kjøretime", object: "Lesson", objectId: "l-1", signature: "Sikker PIN" },
  { id: "a-2", ts: "2026-05-12T09:10", user: "Anders Johansen", role: "Faglig leder", action: "Genererte tilsynseksport", object: "Export", objectId: "EXP-2026-05-12-01" },
  { id: "a-3", ts: "2026-05-11T22:00", user: "system", role: "System", action: "Mock backup-jobb fullført", object: "Backup", objectId: "BACKUP-2026-05" },
  { id: "a-4", ts: "2026-05-10T11:00", user: "Erik Stenberg", role: "Trafikklærer", action: "Registrerte obligatorisk element", object: "Lesson", objectId: "l-3", signature: "Mock BankID" },
  { id: "a-5", ts: "2026-05-09T14:30", user: "Siri Nilsen", role: "Trafikklærer", action: "Signerte veiledningstime-protokoll", object: "Guidance", objectId: "g-002", signature: "Sikker PIN" },
];

export type PracticeEntry = {
  id: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
  km: number;
  route: string;
  weather: string;
  traffic: string;
  accompanying: string;
  notes: string;
  sharedWithTeacher: boolean;
};

export const practice: PracticeEntry[] = [
  { id: "pp-1", studentId: "s-001", date: "2026-05-04", startTime: "17:30", endTime: "18:45", km: 22, route: "Oslo–Bærum tur/retur", weather: "Skyet", traffic: "Moderat", accompanying: "Kari Johansen", notes: "Øvde på rundkjøringer", sharedWithTeacher: true },
  { id: "pp-2", studentId: "s-001", date: "2026-05-07", startTime: "10:00", endTime: "11:30", km: 38, route: "E18 mot Drammen", weather: "Sol", traffic: "Tett", accompanying: "Per Johansen", notes: "Motorvei og forbikjøring", sharedWithTeacher: false },
];

export type Message = {
  id: string;
  threadId: string;
  fromId: string;
  toId: string;
  ts: string;
  body: string;
  read: boolean;
};

export const messages: Message[] = [
  { id: "m-1", threadId: "thr-1", fromId: "t-001", toId: "s-001", ts: "2026-05-11T16:00", body: "Hei Magnus, husk å lese kapittel 5 før neste time.", read: true },
  { id: "m-2", threadId: "thr-1", fromId: "s-001", toId: "t-001", ts: "2026-05-11T16:42", body: "Skal gjøres! Sees i morgen.", read: true },
  { id: "m-3", threadId: "thr-2", fromId: "t-002", toId: "s-002", ts: "2026-05-12T07:55", body: "Veiledningstime kl 10 — vi møtes ved kjøreskolen.", read: false },
];

export type Package = { id: string; name: string; price: number; lessons: number };
export const packages: Package[] = [
  { id: "pkg-1", name: "10 kjøretimer klasse B", price: 8900, lessons: 10 },
  { id: "pkg-2", name: "Obligatorisk trinn 4-pakke", price: 13500, lessons: 7 },
  { id: "pkg-3", name: "Trafikalt grunnkurs", price: 2950, lessons: 1 },
  { id: "pkg-4", name: "Enkel kjøretime", price: 950, lessons: 1 },
];

// Helpers
export const getStudent = (id: string) => students.find((s) => s.id === id);
export const getTeacher = (id: string) => teachers.find((t) => t.id === id);
export const studentsForTeacher = (teacherId: string) =>
  students.filter((s) => s.responsibleTeacherId === teacherId);
export const lessonsFor = ({ teacherId, studentId }: { teacherId?: string; studentId?: string }) =>
  lessons.filter((l) => (teacherId ? l.teacherId === teacherId : true) && (studentId ? l.studentId === studentId : true));

export const computeComplianceScore = () => {
  let score = 100;
  // Penalties
  const failed = reports.filter((r) => r.status === "Feilet").length;
  score -= failed * 4;
  const missing = students.filter((s) => s.docStatus === "Mangler").length;
  score -= missing * 3;
  const expiredTeachers = teachers.filter((t) => t.status === "Utløpt").length;
  score -= expiredTeachers * 6;
  if (!backupState.signed) score -= 5;
  return Math.max(0, Math.min(100, score));
};

// Mutable backup state for the prototype
export const backupState = {
  month: "April 2026",
  signed: false,
  signedBy: undefined as string | undefined,
  signedAt: undefined as string | undefined,
  hash: "8a4f9e2d1c0b7a6f3e5d4c2b1a0f9e8d",
};
