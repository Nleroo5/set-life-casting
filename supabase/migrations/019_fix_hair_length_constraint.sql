/**
 * Migration 019: Fix hair_length CHECK constraint
 *
 * PURPOSE: Add 'Buzz' to the allowed hair_length values
 * FIXES: Users who select "Buzz" in the form get a database constraint error
 *
 * Created: 2026-02-27
 */

-- Drop the existing constraint and re-add with 'Buzz' included
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_hair_length_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_hair_length_check
  CHECK (hair_length IN ('Bald', 'Buzz', 'Short', 'Medium', 'Long'));
