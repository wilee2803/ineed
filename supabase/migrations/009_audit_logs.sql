-- ============================================================
-- MIGRATION 009 · Audit Logs
-- Unveränderliches Protokoll aller sicherheitsrelevanten Events
-- Kein DELETE, kein UPDATE — append-only
-- ============================================================

create table audit_logs (
  id          bigserial   primary key,
  entity_type text        not null,   -- 'booking', 'lock', 'payment', 'kyc', 'listing'
  entity_id   uuid        not null,
  action      text        not null,   -- 'lock_opened', 'payment_captured', 'kyc_approved'
  actor_id    uuid,                   -- Wer hat es ausgelöst (null = System)
  actor_role  text,                   -- 'seeker', 'lister', 'admin', 'system'
  ip_address  inet,
  metadata    jsonb       default '{}',
  created_at  timestamptz not null default now()
);

-- Nur Insert erlaubt — kein Update/Delete (Sicherheit)
create index audit_entity_idx   on audit_logs (entity_type, entity_id);
create index audit_actor_idx    on audit_logs (actor_id, created_at);
create index audit_action_idx   on audit_logs (action, created_at);

-- Hilfsfunktion um Audit-Einträge zu erstellen
create or replace function log_audit(
  p_entity_type text,
  p_entity_id   uuid,
  p_action      text,
  p_actor_id    uuid    default null,
  p_actor_role  text    default 'system',
  p_metadata    jsonb   default '{}'
) returns void language plpgsql security definer as $$
begin
  insert into audit_logs (entity_type, entity_id, action, actor_id, actor_role, metadata)
  values (p_entity_type, p_entity_id, p_action, p_actor_id, p_actor_role, p_metadata);
end;
$$;

-- Automatisches Audit-Log bei Lock-Events (Booking-Updates)
create or replace function audit_booking_changes()
returns trigger language plpgsql as $$
begin
  if old.lock_opened_at is null and new.lock_opened_at is not null then
    perform log_audit('lock', new.id, 'lock_opened', new.seeker_id, 'seeker',
      jsonb_build_object('listing_id', new.listing_id, 'opened_at', new.lock_opened_at));
  end if;

  if old.lock_closed_at is null and new.lock_closed_at is not null then
    perform log_audit('lock', new.id, 'lock_closed', new.seeker_id, 'seeker',
      jsonb_build_object('listing_id', new.listing_id, 'closed_at', new.lock_closed_at));
  end if;

  if old.deposit_captured = false and new.deposit_captured = true then
    perform log_audit('payment', new.id, 'deposit_captured', null, 'system',
      jsonb_build_object('amount', new.deposit_amount, 'currency', new.deposit_currency));
  end if;

  if old.deposit_released_at is null and new.deposit_released_at is not null then
    perform log_audit('payment', new.id, 'deposit_released', null, 'system',
      jsonb_build_object('amount', new.deposit_amount, 'reason', new.deposit_release_reason));
  end if;

  return new;
end;
$$;

create trigger bookings_audit
  after update on bookings
  for each row execute procedure audit_booking_changes();
