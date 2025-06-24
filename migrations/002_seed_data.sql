-- Insert test users
INSERT INTO users (id, email, password_hash, role, status)
VALUES
  (gen_random_uuid(), 'admin@example.com', crypt('Admin1234!', gen_salt('bf')), 'admin', 'approved'),
  (gen_random_uuid(), 'user@example.com', crypt('User1234!', gen_salt('bf')), 'guest', 'pending');

-- Insert test decision
INSERT INTO decisions (external_id, title, content, date, jurisdiction, source)
VALUES
  ('EX123456', 'Test Decision Title', 'Lorem ipsum dolor sit amet...', '2024-01-10', 'Cour de cassation', 'api');

INSERT INTO decisions (date, jurisdiction, case_type, title, content, source)
VALUES ('2024-01-15', 'Cour d''appel', 'Civil', 'Affaire Dupont vs Martin', 'Texte de la décision.', 'api');

-- Insert test tags
INSERT INTO tags (label)
VALUES
  ('contrat'), ('travail'), ('droit public')
ON CONFLICT DO NOTHING;

-- Link tags to decision
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id
FROM decisions d, tags t
WHERE d.external_id = 'EX123456' AND t.label = 'travail';

-- Insert test archive
INSERT INTO archives (title, content, date, jurisdiction, location, user_id)
SELECT 'Test Archive', 'Contenu archivé', '2023-12-01', 'TA Lyon', 'Lyon',
       u.id
FROM users u
WHERE u.email = 'admin@example.com'
LIMIT 1;

-- Insert test note
INSERT INTO notes (user_id, target_id, target_type, content)
SELECT u.id, d.id, 'decision', 'Cette décision est importante.'
FROM users u, decisions d
WHERE u.email = 'admin@example.com' AND d.external_id = 'EX123456'
LIMIT 1;
