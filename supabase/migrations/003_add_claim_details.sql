-- Migration: Add source_url and verbatim_quote to claims
-- Run this in Supabase SQL Editor

ALTER TABLE claims 
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS verbatim_quote TEXT;

-- Add comment for documentation
COMMENT ON COLUMN claims.source_url IS 'Direct URL to the source of this claim';
COMMENT ON COLUMN claims.verbatim_quote IS 'Exact quote from the source material';
