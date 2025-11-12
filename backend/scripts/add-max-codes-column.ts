import { supabase } from '../src/config/database'
import { logger } from '../src/utils/logger'

async function addMaxCodesColumn() {
  logger.info('Ajout colonne max_codes_allowed à la table users...\n')
  
  // Cette opération doit être faite manuellement dans Supabase SQL Editor
  logger.info('SQL à exécuter dans Supabase SQL Editor :')
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  logger.info(`
-- Ajouter colonne max_codes_allowed
ALTER TABLE users 
ADD COLUMN max_codes_allowed INTEGER DEFAULT 3;

-- Mettre à jour les ambassadeurs existants
UPDATE users 
SET max_codes_allowed = 20 
WHERE is_ambassador = true;

-- Les admins ont illimité (valeur très élevée)
UPDATE users 
SET max_codes_allowed = 999999 
WHERE role = 'admin';
  `)
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  logger.info('Une fois exécuté, relancer ce script pour vérifier.')
  
  // Vérifier si la colonne existe
  const { data, error } = await supabase
    .from('users')
    .select('max_codes_allowed')
    .limit(1)
  
  if (error) {
    logger.error('❌ Colonne pas encore ajoutée')
    logger.error('   Erreur:', error.message)
  } else {
    logger.info('✅ Colonne max_codes_allowed existe!')
  }
}

addMaxCodesColumn()

