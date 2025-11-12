import { supabase } from '../src/config/database'
import { logger } from '../src/utils/logger'

async function addEventsFields() {
  logger.info('Ajout des champs event_end_date et status à la table events...\n')
  
  logger.info('SQL à exécuter dans Supabase SQL Editor :')
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  logger.info(`
-- 1. Ajouter colonne event_end_date
ALTER TABLE events 
ADD COLUMN event_end_date TIMESTAMPTZ;

-- 2. Ajouter colonne status
ALTER TABLE events 
ADD COLUMN status TEXT DEFAULT 'upcoming'
  CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled'));

-- 3. Mettre à jour les événements existants
-- Par défaut, event_end_date = event_date + 3 heures
UPDATE events 
SET event_end_date = event_date + INTERVAL '3 hours'
WHERE event_end_date IS NULL;

-- 4. Mettre à jour les statuts en fonction des dates
UPDATE events
SET status = CASE
  WHEN event_end_date < NOW() THEN 'completed'
  WHEN event_date <= NOW() AND event_end_date >= NOW() THEN 'ongoing'
  ELSE 'upcoming'
END
WHERE is_active = true;

-- 5. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(event_date, event_end_date);
  `)
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  logger.info('Une fois exécuté, relancer ce script pour vérifier.\n')
  
  // Vérifier si les colonnes existent
  const { data, error } = await supabase
    .from('events')
    .select('event_end_date, status')
    .limit(1)
  
  if (error) {
    logger.error('❌ Colonnes pas encore ajoutées')
    logger.error('   Erreur:', error.message)
  } else {
    logger.info('✅ Colonnes event_end_date et status existent!')
    
    // Statistiques
    const { data: stats } = await supabase
      .from('events')
      .select('status')
    
    const statusCount = stats?.reduce((acc: any, e: any) => {
      acc[e.status] = (acc[e.status] || 0) + 1
      return acc
    }, {})
    
    logger.info('\n📊 Statistiques des événements :')
    Object.entries(statusCount || {}).forEach(([status, count]) => {
      logger.info(`   ${status}: ${count}`)
    })
  }
}

addEventsFields()

