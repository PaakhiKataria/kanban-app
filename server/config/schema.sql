-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Board members table
CREATE TABLE IF NOT EXISTS board_members (
  id SERIAL PRIMARY KEY,
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'editor',
  UNIQUE(board_id, user_id)
);

-- Columns table
CREATE TABLE IF NOT EXISTS columns (
  id SERIAL PRIMARY KEY,
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  column_id INTEGER REFERENCES columns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);