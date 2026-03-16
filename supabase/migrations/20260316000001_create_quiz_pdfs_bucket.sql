-- Create the quiz-pdfs storage bucket if it doesn't already exist.
-- Run this migration in the Supabase SQL editor or via `supabase db push`.

INSERT INTO storage.buckets (id, name, public)
VALUES ('quiz-pdfs', 'quiz-pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to objects in quiz-pdfs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'quiz-pdfs public read'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "quiz-pdfs public read"
        ON storage.objects
        FOR SELECT
        USING (bucket_id = 'quiz-pdfs');
    $policy$;
  END IF;
END $$;

-- Allow service-role (and authenticated) inserts / upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'quiz-pdfs service role insert'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "quiz-pdfs service role insert"
        ON storage.objects
        FOR INSERT
        WITH CHECK (bucket_id = 'quiz-pdfs');
    $policy$;
  END IF;
END $$;
