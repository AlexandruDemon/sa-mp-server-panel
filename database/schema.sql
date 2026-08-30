-- Creează tabelul pentru admini
CREATE TABLE admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creează tabelul pentru jucători
CREATE TABLE players (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nickname VARCHAR(24) NOT NULL,
  account_name VARCHAR(50),
  ip_address VARCHAR(15),
  banned INT DEFAULT 0,
  ban_reason VARCHAR(255),
  ban_until DATETIME,
  muted INT DEFAULT 0,
  mute_until DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP
);

-- Creează tabelul pentru statistici jucător
CREATE TABLE player_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  player_id INT NOT NULL,
  kills INT DEFAULT 0,
  deaths INT DEFAULT 0,
  money INT DEFAULT 0,
  score INT DEFAULT 0,
  level INT DEFAULT 1,
  playtime INT DEFAULT 0,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Creează tabelul pentru log-urile acțiunilor
CREATE TABLE actions_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_id INT,
  player_id INT,
  action VARCHAR(50) NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Creează tabelul pentru comenzi
CREATE TABLE commands (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255),
  usage VARCHAR(100),
  admin_level INT DEFAULT 1
);

-- Creează tabelul pentru informații server
CREATE TABLE server_info (
  id INT PRIMARY KEY AUTO_INCREMENT,
  server_name VARCHAR(100),
  max_players INT DEFAULT 500,
  current_players INT DEFAULT 0,
  gamemode VARCHAR(50),
  language VARCHAR(50),
  status VARCHAR(20) DEFAULT 'online'
);

-- Insert comenzi standard
INSERT INTO commands (name, description, usage, admin_level) VALUES
('kick', 'Dă afară un jucător din server', '/kick [ID/Nume]', 1),
('ban', 'Blochează accesul unui jucător', '/ban [ID/Nume] [Motiv]', 2),
('mute', 'Pune pe mute un jucător', '/mute [ID/Nume] [Minute]', 1),
('warn', 'Avertizează un jucător', '/warn [ID/Nume] [Motiv]', 1),
('give', 'Dă bani unui jucător', '/give [ID/Nume] [Suma]', 2),
('setlevel', 'Setează nivelul unui jucător', '/setlevel [ID/Nume] [Level]', 3);
