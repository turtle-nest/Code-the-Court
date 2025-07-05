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
-- 📚 MOCK DECISIONS + TAGS (CTE avec CAST)
-- ============================================
WITH decisions_data AS (
  SELECT * FROM (VALUES
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Marseille - Succession', 'Décision sur succession et homosexualité', '2021-06-14'::DATE, 'Marseille', 'succession', ARRAY['succession','homosexualité']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Cours d’appel Lyon - Testament', 'Décision testament frère/sœur', '2020-02-03'::DATE, 'Cours d’appel Lyon', 'testament', ARRAY['testament','frère/sœur']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Paris - Divorce', 'Jugement divorce pension alimentaire', '2023-05-12'::DATE, 'Paris', 'divorce', ARRAY['divorce','pension alimentaire','enfant']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Nanterre - Licenciement', 'Affaire licenciement abusif', '2022-11-08'::DATE, 'Nanterre', 'contrat de travail', ARRAY['contrat de travail','licenciement']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Bordeaux - Résiliation bail', 'Résiliation bail immobilier', '2023-04-18'::DATE, 'Bordeaux', 'immobilier', ARRAY['immobilier','bail','résiliation']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Rennes - Pension alimentaire', 'Conflit sur pension alimentaire', '2023-03-01'::DATE, 'Rennes', 'divorce', ARRAY['divorce','pension alimentaire']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Toulouse - Contrat de travail', 'Litige contrat de travail', '2022-10-10'::DATE, 'Toulouse', 'contrat de travail', ARRAY['contrat de travail']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Nice - Testament', 'Testament contesté', '2021-07-15'::DATE, 'Nice', 'testament', ARRAY['testament']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Montpellier - Résiliation bail', 'Résiliation bail logement', '2020-09-22'::DATE, 'Montpellier', 'immobilier', ARRAY['immobilier','bail','résiliation']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Strasbourg - Divorce', 'Affaire de divorce', '2019-06-04'::DATE, 'Strasbourg', 'divorce', ARRAY['divorce']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Lille - Succession', 'Litige héritage succession', '2021-02-19'::DATE, 'Lille', 'succession', ARRAY['succession']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Versailles - Pension alimentaire', 'Affaire pension alimentaire', '2022-07-08'::DATE, 'Versailles', 'divorce', ARRAY['divorce','pension alimentaire']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Nancy - Licenciement', 'Licenciement contesté', '2021-12-15'::DATE, 'Nancy', 'contrat de travail', ARRAY['contrat de travail','licenciement']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Aix-en-Provence - Testament', 'Contestations testamentaires', '2020-05-02'::DATE, 'Aix-en-Provence', 'testament', ARRAY['testament']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Dijon - Bail immobilier', 'Litige immobilier bail', '2022-09-10'::DATE, 'Dijon', 'immobilier', ARRAY['immobilier','bail']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Grenoble - Garde enfant', 'Divorce et garde enfant', '2023-06-28'::DATE, 'Grenoble', 'divorce', ARRAY['divorce','enfant']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Orléans - Licenciement', 'Licenciement abusif', '2023-04-05'::DATE, 'Orléans', 'contrat de travail', ARRAY['contrat de travail','licenciement']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Poitiers - Résiliation bail', 'Résiliation de bail contestée', '2022-03-13'::DATE, 'Poitiers', 'immobilier', ARRAY['immobilier','bail','résiliation']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Metz - Succession', 'Affaire de succession familiale', '2021-01-30'::DATE, 'Metz', 'succession', ARRAY['succession']),
    (gen_random_uuid(), gen_random_uuid(), 'Arrêt Rouen - Testament', 'Litige testamentaire frère/sœur', '2022-11-17'::DATE, 'Rouen', 'testament', ARRAY['testament','frère/sœur'])
  ) AS t (id, external_id, title, content, date, jurisdiction, case_type, tags)
),

ins AS (
  INSERT INTO decisions (id, external_id, title, content, date, jurisdiction, case_type)
  SELECT id, external_id, title, content, date, jurisdiction, case_type
  FROM decisions_data
  RETURNING id, external_id
)

INSERT INTO decision_tags (decision_id, tag_id)
SELECT
  i.id,
  t.id
FROM ins i
JOIN decisions_data dd ON i.external_id = dd.external_id
JOIN tags t ON t.label = ANY(dd.tags);
