-- Migration: Add reminder_sent flag to session_attendees

alter table session_attendees add column if not exists reminder_sent boolean default false;
