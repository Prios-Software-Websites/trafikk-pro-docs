-- TrafikkDokumentasjon Pro — PostgreSQL DDL
-- Målplattform: Lovable Cloud (Supabase / PostgreSQL 15+)
-- Multi-tenant via tenant_id på alle forretningstabeller. RLS aktivert overalt.

-- =========================================================
-- EXTENSIONS
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- ENUMS
-- =========================================================
create type app_role          as enum ('admin','teacher','student','parent','auditor');
create type license_class     as enum ('B','BE','A','A2','C','CE');
create type student_status    as enum ('aktiv','arkivert','pause');
create type doc_status        as enum ('komplett','mangler','utloper');
create type teacher_status    as enum ('gyldig','utloper_snart','utlopt','mangler_dokumentasjon');
create type step_status       as enum ('locked','available','completed','needs_assessment','needs_reporting');
create type lesson_type       as enum ('ordinaer','obligatorisk','veiledningstime');
create type signature_method  as enum ('sikker_pin','mock_bankid','mock_vipps');
create type report_status     as enum ('klar_for_innsending','sendt','mottatt','feilet','krever_manuell_kontroll','ikke_rapporteringspliktig');
create type payment_method    as enum ('vipps','kort','faktura','kontant');
create type payment_status    as enum ('initiert','fullfort','feilet','refundert');

-- =========================================================
-- 1. TENANCY & IDENTITET
-- =========================================================
create table tenants (
  id           uuid primary key default gen_random_uuid(),
  org_no       varchar(9) unique not null,
  name         varchar(120) not null,
  approval_no  varchar(60),
  created_at   timestamptz not null default now()
);

-- public.users speiler auth.users
create table users (
  id              uuid primary key,                 -- = auth.users.id
  tenant_id       uuid not null references tenants(id) on delete cascade,
  email           varchar(255) unique not null,
  full_name       varchar(160) not null,
  phone           varchar(30),
  bankid_verified boolean not null default false,
  created_at      timestamptz not null default now()
);

create table user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  tenant_id  uuid not null references tenants(id) on delete cascade,
  role       app_role not null,
  unique (user_id, tenant_id, role)
);
-- KRITISK: roller MÅ ligge i egen tabell for å hindre privilege escalation.

-- SECURITY DEFINER helper for RLS-policies
create or replace function public.has_role(_user_id uuid, _tenant_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and tenant_id = _tenant_id and role = _role
  )
$$;

create or replace function public.current_tenant()
returns uuid
language sql stable
as $$
  select tenant_id from public.users where id = auth.uid()
$$;

-- =========================================================
-- 2. PERSONER
-- =========================================================
create table teachers (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references tenants(id) on delete cascade,
  user_id            uuid references users(id),
  full_name          varchar(160) not null,
  email              varchar(255),
  status             teacher_status not null default 'gyldig',
  approval_valid_to  date,
  first_aid          boolean not null default false,
  created_at         timestamptz not null default now()
);

create table teacher_qualifications (
  id              uuid primary key default gen_random_uuid(),
  teacher_id      uuid not null references teachers(id) on delete cascade,
  license_class   license_class not null,
  approved_from   date not null,
  approved_to     date not null,
  document_url    text,
  unique (teacher_id, license_class)
);

create table students (
  id                       uuid primary key default gen_random_uuid(),
  tenant_id                uuid not null references tenants(id) on delete cascade,
  user_id                  uuid references users(id),
  student_no               varchar(20) not null,
  full_name                varchar(160) not null,
  ssn_encrypted            bytea,                              -- pgcrypto/pgsodium
  address                  text,
  start_date               date not null default current_date,
  end_date                 date,
  license_class            license_class not null,
  status                   student_status not null default 'aktiv',
  responsible_teacher_id   uuid references teachers(id),
  doc_status               doc_status not null default 'mangler',
  balance_nok              integer not null default 0,         -- i øre
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  unique (tenant_id, student_no)                               -- sekvensiell elevfortegnelse
);
create index on students (tenant_id, status);
create index on students (responsible_teacher_id);

create table parents (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  user_id    uuid references users(id),
  full_name  varchar(160) not null
);

create table student_parents (
  student_id uuid references students(id) on delete cascade,
  parent_id  uuid references parents(id) on delete cascade,
  relation   varchar(40),
  primary key (student_id, parent_id)
);

-- =========================================================
-- 3. OPPLÆRING
-- =========================================================
create table training_cards (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  student_id      uuid not null unique references students(id) on delete cascade,
  license_class   license_class not null,
  opened_at       timestamptz not null default now(),
  closed_at       timestamptz
);

create table trinn (
  id                uuid primary key default gen_random_uuid(),
  training_card_id  uuid not null references training_cards(id) on delete cascade,
  number            smallint not null check (number between 1 and 4),
  status            step_status not null default 'locked',
  unlocked_at       timestamptz,
  completed_at      timestamptz,
  unique (training_card_id, number)
);

create table lessons (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references tenants(id) on delete cascade,
  student_id        uuid not null references students(id) on delete cascade,
  teacher_id        uuid not null references teachers(id),
  scheduled_at      timestamptz not null,
  duration_min      smallint not null,
  type              lesson_type not null,
  trinn_number      smallint not null check (trinn_number between 1 and 4),
  attested          boolean not null default false,
  attested_at       timestamptz,
  signature_method  signature_method,
  notes             text
);
create index on lessons (tenant_id, scheduled_at);
create index on lessons (student_id, scheduled_at);
create index on lessons (teacher_id, scheduled_at);

create table trinn_elements (
  id                      uuid primary key default gen_random_uuid(),
  trinn_id                uuid not null references trinn(id) on delete cascade,
  code                    varchar(20) not null,
  title                   varchar(200) not null,
  is_mandatory            boolean not null default false,
  is_reportable           boolean not null default false,
  status                  step_status not null default 'available',
  completed_at            timestamptz,
  attested_by_lesson_id   uuid references lessons(id)
);

create table guidance_sessions (
  id                  uuid primary key default gen_random_uuid(),
  lesson_id           uuid not null unique references lessons(id) on delete cascade,
  protocol_text       text,
  signed_by_teacher   boolean not null default false,
  signed_by_student   boolean not null default false,
  signed_at           timestamptz
);

create table practice_log (
  id                   uuid primary key default gen_random_uuid(),
  student_id           uuid not null references students(id) on delete cascade,
  date                 date not null,
  start_time           time not null,
  end_time             time not null,
  km                   integer not null check (km >= 0),
  route                text,
  weather              varchar(40),
  traffic              varchar(40),
  accompanying_name    varchar(160),
  notes                text,
  shared_with_teacher  boolean not null default false
);

-- =========================================================
-- 4. COMPLIANCE
-- =========================================================
create table reports (
  id                 uuid primary key default gen_random_uuid(),
  tenant_id          uuid not null references tenants(id) on delete cascade,
  student_id         uuid not null references students(id),
  teacher_id         uuid not null references teachers(id),
  trinn_element_id   uuid references trinn_elements(id),
  license_class      license_class not null,
  completed_at       timestamptz not null,
  status             report_status not null default 'klar_for_innsending',
  attempts           smallint not null default 0,
  api_message        text,
  sent_at            timestamptz,
  acknowledged_at    timestamptz
);
create index on reports (tenant_id, status);

create table audit_log (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references tenants(id) on delete cascade,
  ts                timestamptz not null default now(),
  user_id           uuid references users(id),
  role              app_role,
  action            varchar(80) not null,
  object_type       varchar(40) not null,
  object_id         uuid,
  summary           text,
  reason            text,
  signature_method  signature_method,
  prev_hash         varchar(64),
  hash              varchar(64)
);
create index on audit_log (tenant_id, ts desc);
-- APPEND-ONLY: ingen UPDATE/DELETE-policy under (se RLS-seksjon).

create table backup_signatures (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references tenants(id) on delete cascade,
  period_month      date not null,                              -- første dag i mnd
  signed_by         uuid not null references users(id),
  signed_at         timestamptz not null default now(),
  payload_hash      varchar(64) not null,
  signature_method  signature_method not null,
  unique (tenant_id, period_month)
);

create table supervision_exports (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references tenants(id) on delete cascade,
  generated_by   uuid not null references users(id),
  generated_at   timestamptz not null default now(),
  period_from    date not null,
  period_to      date not null,
  file_url       text,
  summary        jsonb
);

-- =========================================================
-- 5. DRIFT
-- =========================================================
create table packages (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references tenants(id) on delete cascade,
  name              varchar(120) not null,
  price_nok         integer not null,
  lessons_included  smallint not null,
  active            boolean not null default true
);

create table student_packages (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid not null references students(id) on delete cascade,
  package_id          uuid not null references packages(id),
  purchased_at        timestamptz not null default now(),
  remaining_lessons   smallint not null
);

create table bookings (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  student_id    uuid not null references students(id),
  teacher_id    uuid not null references teachers(id),
  lesson_id     uuid references lessons(id),
  requested_at  timestamptz not null default now(),
  confirmed     boolean not null default false,
  cancelled_at  timestamptz
);

create table invoices (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  student_id  uuid not null references students(id),
  amount_nok  integer not null,
  due_date    date not null,
  paid        boolean not null default false,
  issued_at   timestamptz not null default now()
);

create table payments (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  invoice_id    uuid references invoices(id),
  student_id    uuid not null references students(id),
  method        payment_method not null,
  status        payment_status not null default 'initiert',
  amount_nok    integer not null,
  external_ref  varchar(120),
  paid_at       timestamptz
);

-- =========================================================
-- 6. KOMMUNIKASJON
-- =========================================================
create table message_threads (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  subject     varchar(200),
  created_at  timestamptz not null default now()
);

create table thread_participants (
  thread_id  uuid references message_threads(id) on delete cascade,
  user_id    uuid references users(id) on delete cascade,
  primary key (thread_id, user_id)
);

create table messages (
  id            uuid primary key default gen_random_uuid(),
  thread_id     uuid not null references message_threads(id) on delete cascade,
  from_user_id  uuid not null references users(id),
  body          text not null,
  sent_at       timestamptz not null default now(),
  read_at       timestamptz
);

create table attachments (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references tenants(id) on delete cascade,
  owner_user_id        uuid not null references users(id),
  related_object_type  varchar(40),
  related_object_id    uuid,
  file_url             text not null,
  mime_type            varchar(80),
  uploaded_at          timestamptz not null default now()
);

-- =========================================================
-- ROW LEVEL SECURITY (skisser — utvid per tabell)
-- =========================================================
alter table tenants                enable row level security;
alter table users                  enable row level security;
alter table user_roles             enable row level security;
alter table students               enable row level security;
alter table teachers               enable row level security;
alter table teacher_qualifications enable row level security;
alter table training_cards         enable row level security;
alter table trinn                  enable row level security;
alter table trinn_elements         enable row level security;
alter table lessons                enable row level security;
alter table guidance_sessions      enable row level security;
alter table practice_log           enable row level security;
alter table reports                enable row level security;
alter table audit_log              enable row level security;
alter table backup_signatures      enable row level security;
alter table supervision_exports    enable row level security;
alter table packages               enable row level security;
alter table student_packages       enable row level security;
alter table bookings               enable row level security;
alter table invoices               enable row level security;
alter table payments               enable row level security;
alter table message_threads        enable row level security;
alter table thread_participants    enable row level security;
alter table messages               enable row level security;
alter table attachments            enable row level security;

-- Eksempel: tenant isolation + rolle-basert tilgang
create policy "tenant read students"
  on students for select to authenticated
  using (tenant_id = public.current_tenant());

create policy "admin manage students"
  on students for all to authenticated
  using (tenant_id = public.current_tenant()
         and public.has_role(auth.uid(), tenant_id, 'admin'))
  with check (tenant_id = public.current_tenant()
              and public.has_role(auth.uid(), tenant_id, 'admin'));

create policy "teacher read assigned students"
  on students for select to authenticated
  using (tenant_id = public.current_tenant()
         and public.has_role(auth.uid(), tenant_id, 'teacher')
         and responsible_teacher_id in (
           select id from teachers where user_id = auth.uid()
         ));

-- AUDIT_LOG: append-only — kun INSERT-policy, ingen UPDATE/DELETE
create policy "audit insert"   on audit_log for insert to authenticated
  with check (tenant_id = public.current_tenant());
create policy "audit read"     on audit_log for select to authenticated
  using (tenant_id = public.current_tenant()
         and (public.has_role(auth.uid(), tenant_id, 'admin')
           or public.has_role(auth.uid(), tenant_id, 'auditor')));

-- =========================================================
-- INTEGRITETSREGEL: lærer må ha gyldig kompetanse for timens klasse
-- =========================================================
create or replace function enforce_teacher_qualification()
returns trigger language plpgsql as $$
declare
  v_class license_class;
begin
  select s.license_class into v_class from students s where s.id = new.student_id;
  if not exists (
    select 1 from teacher_qualifications q
    where q.teacher_id = new.teacher_id
      and q.license_class = v_class
      and current_date between q.approved_from and q.approved_to
  ) then
    raise exception 'Lærer % mangler gyldig godkjenning for klasse %', new.teacher_id, v_class;
  end if;
  return new;
end $$;

create trigger trg_lessons_qualification
before insert or update of teacher_id, student_id on lessons
for each row execute function enforce_teacher_qualification();
