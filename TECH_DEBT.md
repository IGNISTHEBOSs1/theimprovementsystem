# Migration Lineage Reconciliation

Status:
Blocked pending project confirmation

Reason:
Local and remote migration histories diverged before the current workflow.
There is also a concrete project-identity mismatch in the repository:

- `supabase/config.toml` targets `hmsmonrgphopmrrmuikh`.
- `src/integrations/supabase/client.ts` connects the browser app to `xbrzrxfntixkiykfczjf`.

Running `supabase db push`, `migration repair`, or any destructive reconciliation
command before confirming the intended production project could apply schema changes
to the wrong database.

Safe resolution procedure:

1. Confirm which Supabase project is the intended production database.
2. Take a database backup and export the remote migration history/schema from that project.
3. Link the local CLI to that confirmed project only.
4. Compare remote migration history with `supabase/migrations` and the generated
   client types.
5. Create one reviewed reconciliation plan; do not renumber, delete, or opportunistically
   patch existing migration files.
6. Re-generate `src/integrations/supabase/types.ts` from the reconciled schema.
7. Apply and verify the plan in a non-production environment before production.

Decision:
No database migration command is authorized from this workspace until step 1 is
explicitly confirmed.
