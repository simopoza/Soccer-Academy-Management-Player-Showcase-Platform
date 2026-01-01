USE soccer_school;

-- Update opponent names for Matches id 1..13 to external academies (by age group)
UPDATE Matches SET opponent = 'Hawks_U10'       WHERE id = 1;
UPDATE Matches SET opponent = 'Valley_U14'      WHERE id = 2;
UPDATE Matches SET opponent = 'Lions_U10'       WHERE id = 3;
UPDATE Matches SET opponent = 'Riverside_U12'   WHERE id = 4;
UPDATE Matches SET opponent = 'Tigers_U12'      WHERE id = 5;
UPDATE Matches SET opponent = 'Crestwood_U14'   WHERE id = 6;
UPDATE Matches SET opponent = 'Coastal_U16'     WHERE id = 7;
UPDATE Matches SET opponent = 'Eastside_U16'    WHERE id = 8;
UPDATE Matches SET opponent = 'Crestwood_U14'   WHERE id = 9;
UPDATE Matches SET opponent = 'Hawks_U10'       WHERE id = 10;
UPDATE Matches SET opponent = 'Riverside_U12'   WHERE id = 11;
UPDATE Matches SET opponent = 'Coastal_U16'     WHERE id = 12;

-- Verify
SELECT id, date, team_name, opponent FROM Matches WHERE id BETWEEN 1 AND 13 ORDER BY id;
