-- Add optional free-text notes to RSVPs (e.g. "I need help with childcare").
ALTER TABLE rsvps ADD COLUMN notes TEXT NOT NULL DEFAULT '';
