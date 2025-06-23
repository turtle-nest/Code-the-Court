-- Insert demo users
INSERT INTO users (id, email, password_hash, role, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@example.com', '$2b$10$e0MYzXyjpJS7Pd0RVvHwHeFx4q8xF/23TZqzD8eY8g7TbT98.Ze6W', 'admin', 'approved'),
  ('22222222-2222-2222-2222-222222222222', 'researcher@example.com', '$2b$10$e0MYzXyjpJS7Pd0RVvHwHeFx4q8xF/23TZqzD8eY8g7TbT98.Ze6W', 'researcher', 'approved');

-- Insert decisions
INSERT INTO decisions (id, external_id, title, content, date, jurisdiction, source)
VALUES
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'EXT123', 'Decision A', 'Full text of decision A', '2023-05-10', 'Cour de cassation', 'api'),
  ('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'EXT124', 'Decision B', 'Full text of decision B', '2024-01-15', 'Conseil d État', 'api');

-- Insert archive
INSERT INTO archives (id, title, content, date, jurisdiction, location, user_id)
VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Archive A', 'Text from archive', '2023-09-01', 'TA Paris', 'Archives nationales', '22222222-2222-2222-2222-222222222222');

-- Insert tags
INSERT INTO tags (id, label)
VALUES
  ('t1t1t1t1-t1t1-t1t1-t1t1-t1t1t1t1t1t1', 'droit du travail'),
  ('t2t2t2t2-t2t2-t2t2-t2t2-t2t2t2t2t2t2', 'procédure pénale');

-- Link decision to tags
INSERT INTO decision_tags (decision_id, tag_id)
VALUES
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 't1t1t1t1-t1t1-t1t1-t1t1-t1t1t1t1t1t1'),
  ('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 't2t2t2t2-t2t2-t2t2-t2t2-t2t2t2t2t2t2');

-- Insert note
INSERT INTO notes (id, user_id, target_id, target_type, content)
VALUES
  ('n1n1n1n1-n1n1-n1n1-n1n1-n1n1n1n1n1n1', '22222222-2222-2222-2222-222222222222', 'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'decision', 'This is a test annotation.');
