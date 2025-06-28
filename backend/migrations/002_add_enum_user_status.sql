CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE users
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE user_status USING status::user_status,
  ALTER COLUMN status SET DEFAULT 'pending';
