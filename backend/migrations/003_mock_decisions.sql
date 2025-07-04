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
-- 📚 MOCK DECISIONS (harmonisé)
-- ============================================
INSERT INTO decisions (id, external_id, title, content, date, jurisdiction, case_type) VALUES
  (gen_random_uuid(), 'EXT001', 'Arrêt Marseille - Succession', 'Décision sur succession et homosexualité', '2021-06-14', 'Marseille', 'succession'),
  (gen_random_uuid(), 'EXT002', 'Arrêt Cours d’appel Lyon - Testament', 'Décision testament frère/sœur', '2020-02-03', 'Cours d’appel Lyon', 'testament'),
  (gen_random_uuid(), 'EXT003', 'Arrêt Paris - Divorce', 'Jugement divorce pension alimentaire', '2023-05-12', 'Paris', 'divorce'),
  (gen_random_uuid(), 'EXT004', 'Arrêt Nanterre - Licenciement', 'Affaire licenciement abusif', '2022-11-08', 'Nanterre', 'contrat de travail'),
  (gen_random_uuid(), 'EXT005', 'Arrêt Bordeaux - Résiliation bail', 'Résiliation bail immobilier', '2023-04-18', 'Bordeaux', 'immobilier'),
  (gen_random_uuid(), 'EXT006', 'Arrêt Rennes - Pension alimentaire', 'Conflit sur pension alimentaire', '2023-03-01', 'Rennes', 'divorce'),
  (gen_random_uuid(), 'EXT007', 'Arrêt Toulouse - Contrat de travail', 'Litige contrat de travail', '2022-10-10', 'Toulouse', 'contrat de travail'),
  (gen_random_uuid(), 'EXT008', 'Arrêt Nice - Testament', 'Testament contesté', '2021-07-15', 'Nice', 'testament'),
  (gen_random_uuid(), 'EXT009', 'Arrêt Montpellier - Résiliation bail', 'Résiliation bail logement', '2020-09-22', 'Montpellier', 'immobilier'),
  (gen_random_uuid(), 'EXT010', 'Arrêt Strasbourg - Divorce', 'Affaire de divorce', '2019-06-04', 'Strasbourg', 'divorce'),
  (gen_random_uuid(), 'EXT011', 'Arrêt Lille - Succession', 'Litige héritage succession', '2021-02-19', 'Lille', 'succession'),
  (gen_random_uuid(), 'EXT012', 'Arrêt Versailles - Pension alimentaire', 'Affaire pension alimentaire', '2022-07-08', 'Versailles', 'divorce'),
  (gen_random_uuid(), 'EXT013', 'Arrêt Nancy - Licenciement', 'Licenciement contesté', '2021-12-15', 'Nancy', 'contrat de travail'),
  (gen_random_uuid(), 'EXT014', 'Arrêt Aix-en-Provence - Testament', 'Contestations testamentaires', '2020-05-02', 'Aix-en-Provence', 'testament'),
  (gen_random_uuid(), 'EXT015', 'Arrêt Dijon - Bail immobilier', 'Litige immobilier bail', '2022-09-10', 'Dijon', 'immobilier'),
  (gen_random_uuid(), 'EXT016', 'Arrêt Grenoble - Garde enfant', 'Divorce et garde enfant', '2023-06-28', 'Grenoble', 'divorce'),
  (gen_random_uuid(), 'EXT017', 'Arrêt Orléans - Licenciement', 'Licenciement abusif', '2023-04-05', 'Orléans', 'contrat de travail'),
  (gen_random_uuid(), 'EXT018', 'Arrêt Poitiers - Résiliation bail', 'Résiliation de bail contestée', '2022-03-13', 'Poitiers', 'immobilier'),
  (gen_random_uuid(), 'EXT019', 'Arrêt Metz - Succession', 'Affaire de succession familiale', '2021-01-30', 'Metz', 'succession'),
  (gen_random_uuid(), 'EXT020', 'Arrêt Rouen - Testament', 'Litige testamentaire frère/sœur', '2022-11-17', 'Rouen', 'testament');

-- ============================================
-- 📚 MOCK DECISION_TAGS
-- ============================================

-- EXT001
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('succession', 'homosexualité') WHERE d.external_id = 'EXT001';

-- EXT002
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('testament', 'frère/sœur') WHERE d.external_id = 'EXT002';

-- EXT003
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('divorce', 'pension alimentaire', 'enfant') WHERE d.external_id = 'EXT003';

-- EXT004
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('contrat de travail', 'licenciement') WHERE d.external_id = 'EXT004';

-- EXT005
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('immobilier', 'bail', 'résiliation') WHERE d.external_id = 'EXT005';

-- EXT006
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('divorce', 'pension alimentaire') WHERE d.external_id = 'EXT006';

-- EXT007
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('contrat de travail') WHERE d.external_id = 'EXT007';

-- EXT008
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('testament') WHERE d.external_id = 'EXT008';

-- EXT009
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('immobilier', 'bail', 'résiliation') WHERE d.external_id = 'EXT009';

-- EXT010
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('divorce') WHERE d.external_id = 'EXT010';

-- EXT011
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('succession') WHERE d.external_id = 'EXT011';

-- EXT012
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('divorce', 'pension alimentaire') WHERE d.external_id = 'EXT012';

-- EXT013
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('contrat de travail', 'licenciement') WHERE d.external_id = 'EXT013';

-- EXT014
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('testament') WHERE d.external_id = 'EXT014';

-- EXT015
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('immobilier', 'bail') WHERE d.external_id = 'EXT015';

-- EXT016
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('divorce', 'enfant') WHERE d.external_id = 'EXT016';

-- EXT017
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('contrat de travail', 'licenciement') WHERE d.external_id = 'EXT017';

-- EXT018
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('immobilier', 'bail', 'résiliation') WHERE d.external_id = 'EXT018';

-- EXT019
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('succession') WHERE d.external_id = 'EXT019';

-- EXT020
INSERT INTO decision_tags (decision_id, tag_id)
SELECT d.id, t.id FROM decisions d JOIN tags t ON t.label IN ('testament', 'frère/sœur') WHERE d.external_id = 'EXT020';
