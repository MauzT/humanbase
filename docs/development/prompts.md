# Codex Prompts

Diese Datei enthält fertige Prompts für die nächsten Humanbase-Phasen. Jeder Prompt hält den Scope bewusst klein und schützt den funktionierenden Prototyp.

## Phase 3A: Prisma und lokales PostgreSQL

```text
We are starting Humanbase Phase 3A: local PostgreSQL and Prisma foundation.

First inspect the repository and read the relevant product and architecture docs. Do not change files until you summarize the current state and propose a small, reviewable implementation plan.

Scope:
- add Prisma
- add a local PostgreSQL setup
- create User, Note, Contact, Tag, NoteContact and NoteTag models
- make every Note, Contact and Tag belong to a User
- prepare Contact with source, externalProvider, externalId and lastSyncedAt
- document local setup and environment variables

Out of scope:
- authentication
- Google OAuth or Google API calls
- cloud deployment
- database-backed UI changes
- application redesign

Preserve the existing working prototype. Prefer portable PostgreSQL and Prisma patterns. Keep changes small and reviewable.
```

## Phase 3B: Seed-Daten und CRUD

```text
We are starting Humanbase Phase 3B: seed data and database-backed CRUD.

First inspect the repository, the Phase 3A implementation and the relevant docs. Do not change files until you summarize the current state and propose a small, reviewable implementation plan.

Scope:
- seed PostgreSQL from the current mock data
- replace local-only note persistence with database-backed CRUD
- load contacts and tags from the database
- preserve timeline, filters, create, edit and delete behavior
- keep the existing UI as stable as possible

Out of scope:
- authentication
- Google OAuth or Google Contacts import
- cloud deployment
- UI redesign
- advanced features

Keep each change small and reviewable. Do not break the existing working prototype.
```

## Phase 3C: Export und Backup

```text
We are starting Humanbase Phase 3C: export and backup foundation.

First inspect the repository and relevant docs. Do not change files until you summarize the current state and propose a small, reviewable implementation plan.

Scope:
- add JSON export for notes, contacts, tags and relationships
- document a manual PostgreSQL dump
- document restore steps and a restore test
- keep the export format portable and understandable
- optionally note a future CSV export path

Out of scope:
- cloud deployment
- authentication
- Google OAuth
- provider-specific backup automation
- advanced features

Preserve the existing working app and keep changes small and reviewable.
```

## Phase 4: Cloud-Datenbank planen

```text
Plan Humanbase Phase 4: personal cloud database.

First inspect the repository and relevant docs. Do not change files until you summarize the current state and propose a small, reviewable plan.

Scope:
- evaluate Supabase primarily as managed PostgreSQL
- keep Google Cloud SQL or another managed PostgreSQL provider as a migration path
- prefer an EU region where relevant
- identify provider security settings, environment variables, backup settings and migration steps
- preserve PostgreSQL and Prisma portability

Out of scope:
- performing the deployment
- authentication implementation
- Google OAuth
- proprietary provider features unless clearly justified

Do not break the local working setup. Avoid unnecessary vendor lock-in.
```

## Phase 5: Authentifizierung planen

```text
Plan Humanbase Phase 5: authentication for personal cloud use.

First inspect the repository and relevant docs. Do not change files until you summarize the current state and propose a small, reviewable plan.

Scope:
- evaluate authentication options for single-user or limited-user use
- ensure every record is scoped by userId
- keep public registration disabled unless explicitly enabled
- document password and 2FA expectations
- preserve portability where practical

Out of scope:
- implementing authentication
- Google Contacts import
- team features
- public SaaS onboarding

Do not break the existing working app. Prefer the simplest secure option.
```

## Phase 7: Google Contacts Import planen

```text
Plan Humanbase Phase 7: read-only Google Contacts import.

First inspect the repository and relevant docs. Do not change files until you summarize the current state and propose a small, reviewable plan.

Scope:
- plan Google OAuth after cloud persistence and authentication are stable
- use the Google People API for read-only import
- request minimal Google scopes
- store imported contacts as normal Humanbase Contact records
- use source, externalProvider, externalId and lastSyncedAt
- describe token storage and security requirements for the later implementation

Out of scope:
- implementing OAuth now
- two-way sync
- writing changes back to Google
- unrelated UI redesign
- AI features

Preserve portability and keep the future implementation small and reviewable.
```
