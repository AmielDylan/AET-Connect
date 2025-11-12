import { supabase } from '../src/config/database'
import { logger } from '../src/utils/logger'

async function createEventsTables() {
  logger.info('Création des tables events et event_participants...\n')
  
  logger.info('SQL à exécuter dans Supabase SQL Editor :')
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  logger.info(`
-- Table events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  address VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  max_participants INTEGER,
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table event_participants
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_country ON events(country);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);

-- RLS (Row Level Security) - Politique pour lecture publique des événements actifs
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Events are viewable by everyone"
  ON events FOR SELECT
  USING (is_active = true);

-- Politique pour création (authentifiés uniquement)
CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Politique pour modification (créateur ou admin uniquement)
CREATE POLICY "Event creators can update their events"
  ON events FOR UPDATE
  USING (auth.uid() = created_by_user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Politique pour suppression (créateur ou admin uniquement)
CREATE POLICY "Event creators can delete their events"
  ON events FOR DELETE
  USING (auth.uid() = created_by_user_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- RLS pour event_participants
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;

-- Politique pour lecture (participants et créateurs d'événements)
CREATE POLICY "Participants can view registrations"
  ON event_participants FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM events 
      WHERE id = event_participants.event_id 
      AND created_by_user_id = auth.uid()
    )
  );

-- Politique pour inscription (authentifiés uniquement)
CREATE POLICY "Authenticated users can register to events"
  ON event_participants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- Politique pour désinscription (utilisateur uniquement)
CREATE POLICY "Users can unregister from events"
  ON event_participants FOR DELETE
  USING (auth.uid() = user_id);
  `)
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  logger.info('Une fois exécuté, relancer ce script pour vérifier.\n')
  
  // Vérifier si les tables existent
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id')
    .limit(1)
  
  if (eventsError) {
    logger.error('❌ Table events pas encore créée')
    logger.error('   Erreur:', eventsError.message)
  } else {
    logger.info('✅ Table events existe!')
  }
  
  const { data: participants, error: participantsError } = await supabase
    .from('event_participants')
    .select('id')
    .limit(1)
  
  if (participantsError) {
    logger.error('❌ Table event_participants pas encore créée')
    logger.error('   Erreur:', participantsError.message)
  } else {
    logger.info('✅ Table event_participants existe!')
  }
}

createEventsTables()

