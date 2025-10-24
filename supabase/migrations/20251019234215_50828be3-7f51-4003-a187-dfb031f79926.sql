-- Update booths 1-5 from '본관 부스' to just '부스'
UPDATE booths SET location = '부스 1' WHERE booth_id = 1;
UPDATE booths SET location = '부스 2' WHERE booth_id = 2;
UPDATE booths SET location = '부스 3' WHERE booth_id = 3;
UPDATE booths SET location = '부스 4' WHERE booth_id = 4;
UPDATE booths SET location = '부스 5' WHERE booth_id = 5;

-- Update booth 6 솔리언(또래상담반) to '본관 부스6'
UPDATE booths SET location = '본관 부스6' WHERE booth_id = 6;

-- Update booth 15 애드미찬양반 to position 7
UPDATE booths SET location = '부스 7' WHERE booth_id = 15;