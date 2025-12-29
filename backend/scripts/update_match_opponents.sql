USE soccer_school;

-- Update opponent names for Matches id 32..43 to external academies (by age group)
UPDATE Matches SET opponent = 'Hawks_U10'       WHERE id = 32;
UPDATE Matches SET opponent = 'Valley_U14'      WHERE id = 33;
UPDATE Matches SET opponent = 'Lions_U10'       WHERE id = 34;
UPDATE Matches SET opponent = 'Riverside_U12'   WHERE id = 35;
UPDATE Matches SET opponent = 'Tigers_U12'      WHERE id = 36;
UPDATE Matches SET opponent = 'Crestwood_U14'   WHERE id = 37;
UPDATE Matches SET opponent = 'Coastal_U16'     WHERE id = 38;
UPDATE Matches SET opponent = 'Eastside_U16'    WHERE id = 39;
UPDATE Matches SET opponent = 'Crestwood_U14'   WHERE id = 40;
UPDATE Matches SET opponent = 'Hawks_U10'       WHERE id = 41;
UPDATE Matches SET opponent = 'Riverside_U12'   WHERE id = 42;
UPDATE Matches SET opponent = 'Coastal_U16'     WHERE id = 43;

-- Verify
SELECT id, date, team_name, opponent FROM Matches WHERE id BETWEEN 32 AND 43 ORDER BY id;
