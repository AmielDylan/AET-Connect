import { logger } from '../src/utils/logger'

async function addUserPrivacy() {
  logger.info('Ajout table user_privacy_settings...\n')
  
  logger.info('SQL à exécuter dans Supabase SQL Editor :')
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  logger.info(`
-- 1. Créer table user_privacy_settings
CREATE TABLE user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Visibilité des champs
  show_email BOOLEAN DEFAULT false,
  show_phone BOOLEAN DEFAULT false,
  show_current_location BOOLEAN DEFAULT true,
  show_bio BOOLEAN DEFAULT true,
  show_linkedin BOOLEAN DEFAULT true,
  show_entry_year BOOLEAN DEFAULT true,
  show_in_directory BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer settings par défaut pour utilisateurs existants
INSERT INTO user_privacy_settings (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- 3. Index pour performance
CREATE INDEX idx_user_privacy_user_id ON user_privacy_settings(user_id);
CREATE INDEX idx_user_privacy_directory ON user_privacy_settings(show_in_directory);
  `)
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

addUserPrivacy()

