-- First, update 솔리언(또래상담반) location from '본관 부스6' to '부스6'
UPDATE booths SET location = '부스6' WHERE booth_id = 6;

-- Drop the existing foreign key constraint
ALTER TABLE stamp_logs DROP CONSTRAINT IF EXISTS stamp_logs_booth_id_fkey;

-- Add it back with ON UPDATE CASCADE
ALTER TABLE stamp_logs 
ADD CONSTRAINT stamp_logs_booth_id_fkey 
FOREIGN KEY (booth_id) 
REFERENCES booths(booth_id) 
ON UPDATE CASCADE 
ON DELETE CASCADE;

-- Now reorganize booth IDs
-- Step 1: Move affected booths to temporary IDs (1000+) to avoid conflicts
UPDATE booths SET booth_id = 1007 WHERE booth_id = 7;  -- 빅데이터투인사이트
UPDATE booths SET booth_id = 1008 WHERE booth_id = 8;  -- ARTY 미술반
UPDATE booths SET booth_id = 1009 WHERE booth_id = 9;  -- BUKU(독서토론반)
UPDATE booths SET booth_id = 1010 WHERE booth_id = 10; -- 빛글
UPDATE booths SET booth_id = 1011 WHERE booth_id = 11; -- 한걸음
UPDATE booths SET booth_id = 1012 WHERE booth_id = 12; -- 축구반
UPDATE booths SET booth_id = 1013 WHERE booth_id = 13; -- 슬램덩크
UPDATE booths SET booth_id = 1014 WHERE booth_id = 14; -- Ballin
UPDATE booths SET booth_id = 1015 WHERE booth_id = 15; -- 애드미찬양반

-- Step 2: Move 애드미찬양반 to booth 7
UPDATE booths SET booth_id = 7 WHERE booth_id = 1015;

-- Step 3: Move others to their new positions (shifted by 1)
UPDATE booths SET booth_id = 8 WHERE booth_id = 1007;   -- 빅데이터투인사이트
UPDATE booths SET booth_id = 9 WHERE booth_id = 1008;   -- ARTY 미술반
UPDATE booths SET booth_id = 10 WHERE booth_id = 1009;  -- BUKU(독서토론반)
UPDATE booths SET booth_id = 11 WHERE booth_id = 1010;  -- 빛글
UPDATE booths SET booth_id = 12 WHERE booth_id = 1011;  -- 한걸음
UPDATE booths SET booth_id = 13 WHERE booth_id = 1012;  -- 축구반
UPDATE booths SET booth_id = 14 WHERE booth_id = 1013;  -- 슬램덩크
UPDATE booths SET booth_id = 15 WHERE booth_id = 1014;  -- Ballin