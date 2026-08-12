-- Migration: Token hardening for meeting links (single-use & flags)

alter table meeting_links add column if not exists single_use boolean default true;
alter table meeting_links add column if not exists used boolean default false;
alter table meeting_links add column if not exists used_at timestamptz;
