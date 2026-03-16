-- Add pdf_url column to quiz_submissions if it doesn't already exist.
-- Run this migration in the Supabase SQL editor or via `supabase db push`.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'quiz_submissions'
      AND column_name  = 'pdf_url'
  ) THEN
    ALTER TABLE public.quiz_submissions
      ADD COLUMN pdf_url text;
  END IF;
END $$;
