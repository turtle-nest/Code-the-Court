-- ============================================
-- 📚 Enable extension for UUID (si pas déjà actif)
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 📚 MOCK TAGS
-- ============================================
INSERT INTO tags (id, label) VALUES
  (gen_random_uuid(), 'homosexualité'),
  (gen_random_uuid(), 'succession'),
  (gen_random_uuid(), 'frère/sœur'),
  (gen_random_uuid(), 'testament'),
  (gen_random_uuid(), 'contrat de travail'),
  (gen_random_uuid(), 'licenciement'),
  (gen_random_uuid(), 'divorce'),
  (gen_random_uuid(), 'pension alimentaire'),
  (gen_random_uuid(), 'enfant'),
  (gen_random_uuid(), 'bail'),
  (gen_random_uuid(), 'résiliation'),
  (gen_random_uuid(), 'immobilier')
ON CONFLICT DO NOTHING;

-- ============================================
-- 📚 MOCK ARCHIVES + DECISIONS liées + TAGS
-- ============================================
WITH archives_data AS (
  SELECT * FROM (VALUES
    (gen_random_uuid(), 'Succession Marseille', 'Succession et homosexualité', '2021-06-14'::DATE, 'Marseille', 'Marseille Archives', '11111111-2222-3333-4444-555555555555'::uuid, NULL),
    (gen_random_uuid(), 'Testament Lyon', 'Testament frère/sœur', '2020-02-03'::DATE, 'Cours d’appel Lyon', 'Lyon Archives', '11111111-2222-3333-4444-555555555555'::uuid, NULL),
    (gen_random_uuid(), 'Divorce Paris', 'Jugement pension alimentaire', '2023-05-12'::DATE, 'Paris', 'Paris Archives', '11111111-2222-3333-4444-555555555555'::uuid, NULL)
  ) AS t (id, title, content, date, jurisdiction, location, user_id, file_path)
),

ins_archives AS (
  INSERT INTO archives (id, title, content, date, jurisdiction, location, user_id, file_path)
  SELECT * FROM archives_data
  RETURNING id, title, jurisdiction, content, date
),

decisions_data AS (
  SELECT
    gen_random_uuid() AS id,
    a.id::text AS external_id, -- ✅ UUID → TEXT pour matcher decisions.external_id
    CONCAT('Arrêt ', a.jurisdiction, ' - Décision liée') AS title,
    a.content AS content,
    a.date AS date,
    a.jurisdiction AS jurisdiction,
    'succession' AS case_type,
    'archive' AS source,
    ARRAY['succession', 'homosexualité'] AS tags
  FROM ins_archives a
),

ins_decisions AS (
  INSERT INTO decisions (id, external_id, title, content, date, jurisdiction, case_type, source)
  SELECT id, external_id, title, content, date, jurisdiction, case_type, source
  FROM decisions_data
  RETURNING id, external_id
)

INSERT INTO decision_tags (decision_id, tag_id)
SELECT
  d.id,
  t.id
FROM ins_decisions d
JOIN decisions_data dd ON d.external_id = dd.external_id -- ✅ MATCH : les deux sont TEXT
JOIN tags t ON t.label = ANY(dd.tags);
