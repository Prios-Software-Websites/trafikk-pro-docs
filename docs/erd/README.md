# ERD — TrafikkDokumentasjon Pro

Datamodell for compliance-first kjøreskoleplattform basert på *Forskrift om trafikkopplæring*.

Disse filene er **kun for utviklere** og er ikke en del av frontend-bygget.

## Filer

| Fil | Formål |
|-----|--------|
| `schema.dbml` | Hovedkilde — rediger her først. Lim inn på [dbdiagram.io](https://dbdiagram.io) for visuell visning. |
| `erd-logical.mmd` | Logisk modell (Mermaid) — entiteter, relasjoner, kardinalitet. Renderes direkte i markdown. |
| `erd-physical.mmd` | Fysisk modell (Mermaid) — datatyper, nøkler, constraints. |
| `schema.sql` | PostgreSQL DDL — direkte kjørbar mot Lovable Cloud / Supabase, inkl. RLS-skisser. |

## To-lags modell

- **Logisk lag** (`erd-logical.mmd` + DBML uten typer): forretningsentiteter og relasjoner. For diskusjon med fagansvarlig og myndighetskrav.
- **Fysisk lag** (`erd-physical.mmd` + `schema.sql`): konkret PostgreSQL-implementasjon for Lovable Cloud, med datatyper, indekser, RLS, og audit-trigger.

## Domeneinndeling

1. **Tenancy & identitet** — `tenants`, `users`, `user_roles`, `app_role` (enum)
2. **Personer** — `students`, `teachers`, `teacher_qualifications`, `parents`
3. **Opplæring** — `training_cards`, `trinn`, `trinn_elements`, `lessons`, `guidance_sessions`, `practice_log`
4. **Compliance** — `reports` (TSK-kø), `audit_log`, `backup_signatures`, `supervision_exports`
5. **Drift** — `bookings`, `packages`, `student_packages`, `payments`, `invoices`
6. **Kommunikasjon** — `message_threads`, `messages`, `attachments`

## Compliance-prinsipper innebygd i modellen

- **Sekvensielt elevnummer** — `students.student_no` er unik per `tenant_id` og genereres sekvensielt (jf. krav om elevfortegnelse).
- **Lærerkompetanse valideres ved attestering** — `lessons.teacher_id` må ha gyldig `teacher_qualifications` for `license_class` på timen.
- **Trinnlogikk** — `trinn_elements.status` styrer låsing av neste trinn. Trinn 4 låses til obligatoriske elementer i Trinn 2 og 3 er attestert.
- **Roller separat fra brukere** — `user_roles` i egen tabell (aldri på `users`/`profiles`) for å unngå privilege escalation.
- **Immutabel revisjonslogg** — `audit_log` er append-only (ingen UPDATE/DELETE-policy).
- **Månedlig backup-signering** — `backup_signatures` lagrer hash + signatur per måned.

## Vedlikehold

1. Endre `schema.dbml` først.
2. Oppdater `erd-logical.mmd` og `erd-physical.mmd` så de matcher.
3. Generer/oppdater `schema.sql`.
4. Commit alt sammen i samme PR — modellen og diagrammene skal aldri sige fra hverandre.
