import { logger } from '../src/utils/logger'

async function addUserProfileColumns() {
  logger.info('Ajout colonnes profil utilisateur à la table users...\n')
  
  logger.info('SQL à exécuter dans Supabase SQL Editor :')
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  logger.info(`
-- Ajouter colonnes profil utilisateur
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_users_bio ON users USING gin(to_tsvector('french', COALESCE(bio, '')));
  `)
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  logger.info('Une fois exécuté, les colonnes seront disponibles pour les profils utilisateur.')
}

addUserProfileColumns()

