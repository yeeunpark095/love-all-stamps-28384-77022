-- Reorder booths: Move #13 축구반 to #15
-- 축구반: #13 → #15
-- 슬램덩크: #14 → #13
-- Ballin: #15 → #14

-- Step 1: Move to temporary IDs
UPDATE booths SET booth_id = 1013 WHERE booth_id = 13; -- 축구반
UPDATE booths SET booth_id = 1014 WHERE booth_id = 14; -- 슬램덩크
UPDATE booths SET booth_id = 1015 WHERE booth_id = 15; -- Ballin

-- Step 2: Move to final positions
UPDATE booths SET booth_id = 13 WHERE booth_id = 1014; -- 슬램덩크
UPDATE booths SET booth_id = 14 WHERE booth_id = 1015; -- Ballin
UPDATE booths SET booth_id = 15 WHERE booth_id = 1013; -- 축구반