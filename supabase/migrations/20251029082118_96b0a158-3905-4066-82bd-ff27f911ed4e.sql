-- Remove '정재은' from STEAM사회참여반 teacher name
UPDATE exhibitions 
SET teacher = '이은영'
WHERE exhibition_id = 12;