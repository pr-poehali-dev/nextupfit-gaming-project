-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  character_class VARCHAR(50) NOT NULL,
  character_emoji VARCHAR(10) NOT NULL,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  total_value DECIMAL(10, 2) NOT NULL,
  xp_reward INTEGER NOT NULL,
  deadline DATE,
  tips TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_quests table (progress tracking)
CREATE TABLE IF NOT EXISTS user_quests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  quest_id INTEGER NOT NULL REFERENCES quests(id),
  progress DECIMAL(10, 2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  UNIQUE(user_id, quest_id)
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  achievement_id INTEGER NOT NULL REFERENCES achievements(id),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  activity_type VARCHAR(50) NOT NULL,
  activity_date DATE NOT NULL,
  duration_minutes INTEGER,
  distance_km DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample quests
INSERT INTO quests (title, description, category, icon, total_value, xp_reward, tips) VALUES
('Марафон Героя', 'Пробеги 5 км за эту неделю', 'cardio', 'Flame', 5.0, 250, ARRAY['Разминайся перед каждой пробежкой', 'Пей воду во время бега', 'Следи за пульсом']),
('Сила Титана', 'Выполни 50 отжиманий', 'strength', 'Zap', 50.0, 150, ARRAY['Держи спину ровно', 'Дыши правильно', 'Делай перерывы между подходами']),
('Командный Дух', 'Участвуй в 3 командных тренировках', 'team', 'Users', 3.0, 300, ARRAY['Найди команду в своем классе', 'Поддерживай товарищей', 'Веселись и наслаждайся процессом']);

-- Insert sample achievements
INSERT INTO achievements (name, icon, description, category) VALUES
('Первый рубеж', 'Trophy', 'Завершил свой первый квест', 'milestone'),
('Спринтер', 'Award', 'Пробежал 10 км суммарно', 'cardio'),
('Точность', 'Target', 'Выполнил 5 квестов подряд без пропусков', 'consistency'),
('ГТО Герой', 'Medal', 'Сдал нормы ГТО на золотой значок', 'special');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_status ON user_quests(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date ON activity_logs(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);