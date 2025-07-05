-- ============================================
-- 📚 Insert test users (safe, fixed UUID)
-- ============================================
INSERT INTO users (id, email, password_hash, role, status)
VALUES
  ('11111111-2222-3333-4444-555555555555', 'admin@example.com', crypt('Admin1234!', gen_salt('bf')), 'admin', 'approved'),
  ('22222222-3333-4444-5555-666666666666', 'user@example.com', crypt('User1234!', gen_salt('bf')), 'guest', 'pending')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 📚 Insert test archive + decision liée
-- ============================================
WITH new_archive AS (
  INSERT INTO archives (id, title, content, date, jurisdiction, location, user_id)
  VALUES (
    gen_random_uuid(),
    'Archive Lyon - Contrat de travail',
    'Contenu archivé de test sur contrat de travail.',
    '2023-12-01',
    'Cour d''appel Lyon',
    'Lyon',
    '11111111-2222-3333-4444-555555555555'
  )
  RETURNING id
)

-- ============================================
-- 📚 Insert test tags
-- ============================================
INSERT INTO tags (label)
VALUES
  ('contrat de travail'),
  ('licenciement'),
  ('droit public')
ON CONFLICT DO NOTHING;

-- ============================================
-- 📚 Link tags to decisions
-- ============================================
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id
FROM decisions d, tags t
WHERE d.title ILIKE '%Contrat de travail%' AND t.label = 'contrat de travail';

INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id
FROM decisions d, tags t
WHERE d.title ILIKE '%Droit public%' AND t.label = 'droit public';

-- ============================================
-- 📚 Insert test note
-- ============================================
INSERT INTO notes (user_id, target_id, target_type, content)
SELECT
  '11111111-2222-3333-4444-555555555555',
  d.id,
  'decision',
  'Cette décision test est importante pour vérifier les fonctionnalités.'
FROM decisions d
WHERE d.title ILIKE '%Contrat de travail%'
LIMIT 1;
