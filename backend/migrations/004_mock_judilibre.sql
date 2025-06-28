-- ========================================
-- MOCK DATA : decisions pour Demoday blanc
-- ========================================

-- Ces décisions simulent un import Judilibre local
-- Structure cohérente avec ta table decisions :
-- id: UUID généré automatiquement
-- external_id: identifiant Judilibre-like
-- title, content, date, jurisdiction, case_type
-- source: 'MOCK' pour filtrer facilement
-- public: TRUE pour affichage
-- imported_at: auto DEFAULT

INSERT INTO decisions (
  external_id,
  title,
  content,
  date,
  jurisdiction,
  case_type,
  source,
  public
)
VALUES
('JDLB-0001', 'Arrêt Cour de cassation - Civil', 'Contenu fictif décision 1.', '2024-01-15', 'Cour de cassation', 'Civil', 'MOCK', TRUE),
('JDLB-0002', 'Arrêt Cour de cassation - Pénal', 'Contenu fictif décision 2.', '2024-02-10', 'Cour de cassation', 'Pénal', 'MOCK', TRUE),
('JDLB-0003', 'Arrêt Cour de cassation - Social', 'Contenu fictif décision 3.', '2024-03-05', 'Cour de cassation', 'Social', 'MOCK', TRUE),
('JDLB-0004', 'Arrêt Cour de cassation - Commercial', 'Contenu fictif décision 4.', '2024-04-12', 'Cour de cassation', 'Commercial', 'MOCK', TRUE),
('JDLB-0005', 'Arrêt Cour d''appel - Civil', 'Contenu fictif décision 5.', '2024-05-01', 'Cour d''appel', 'Civil', 'MOCK', TRUE),
('JDLB-0006', 'Arrêt Cour d''appel - Pénal', 'Contenu fictif décision 6.', '2024-05-20', 'Cour d''appel', 'Pénal', 'MOCK', TRUE),
('JDLB-0007', 'Arrêt Cour d''appel - Social', 'Contenu fictif décision 7.', '2024-06-02', 'Cour d''appel', 'Social', 'MOCK', TRUE),
('JDLB-0008', 'Arrêt Cour d''appel - Commercial', 'Contenu fictif décision 8.', '2024-06-10', 'Cour d''appel', 'Commercial', 'MOCK', TRUE),
('JDLB-0009', 'Arrêt Cour d''appel - Civil 2', 'Contenu fictif décision 9.', '2024-06-15', 'Cour d''appel', 'Civil', 'MOCK', TRUE),
('JDLB-0010', 'Arrêt Cour de cassation - Pénal 2', 'Contenu fictif décision 10.', '2024-06-20', 'Cour de cassation', 'Pénal', 'MOCK', TRUE);
