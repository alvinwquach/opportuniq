-- Add step-by-step guide content columns to diy_guides table
-- This enables expandable step-by-step guides in the DIY tab

ALTER TABLE diy_guides ADD COLUMN IF NOT EXISTS steps integer;
ALTER TABLE diy_guides ADD COLUMN IF NOT EXISTS step_content jsonb;
ALTER TABLE diy_guides ADD COLUMN IF NOT EXISTS tools_needed text[];
ALTER TABLE diy_guides ADD COLUMN IF NOT EXISTS duration text;

-- Add comments for documentation
COMMENT ON COLUMN diy_guides.steps IS 'Total number of steps in the guide';
COMMENT ON COLUMN diy_guides.step_content IS 'JSON array of step objects: [{stepNumber, title, description}]';
COMMENT ON COLUMN diy_guides.tools_needed IS 'Array of tool names needed for the repair';
COMMENT ON COLUMN diy_guides.duration IS 'Estimated time to complete, e.g., "15-20 min"';
