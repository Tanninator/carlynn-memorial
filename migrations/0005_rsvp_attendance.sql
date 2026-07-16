-- Add attendance preference (in_person | virtual) to RSVPs.
-- New submissions always set a value; existing rows are backfilled to
-- 'in_person' since every RSVP so far predates the virtual option.
ALTER TABLE rsvps ADD COLUMN attendance TEXT NOT NULL DEFAULT '';
UPDATE rsvps SET attendance = 'in_person' WHERE attendance = '' OR attendance IS NULL;
