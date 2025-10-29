-- Swap booth IDs for 학생회 (4→6) and 솔리언(또래상담반) (6→4)

-- Step 1: Move to temporary IDs to avoid constraint conflicts
UPDATE booths SET booth_id = 994 WHERE booth_id = 4;
UPDATE booths SET booth_id = 996 WHERE booth_id = 6;

-- Update stamp_logs references
UPDATE stamp_logs SET booth_id = 994 WHERE booth_id = 4;
UPDATE stamp_logs SET booth_id = 996 WHERE booth_id = 6;

-- Step 2: Swap to final IDs and update locations
UPDATE booths SET booth_id = 6, location = '6번 부스' WHERE booth_id = 994;
UPDATE booths SET booth_id = 4, location = '4번 부스' WHERE booth_id = 996;

-- Update stamp_logs to final IDs
UPDATE stamp_logs SET booth_id = 6 WHERE booth_id = 994;
UPDATE stamp_logs SET booth_id = 4 WHERE booth_id = 996;