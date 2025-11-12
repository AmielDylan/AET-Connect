import { supabase } from '../src/config/database'
import { logger } from '../src/utils/logger'

async function createMemberCode() {
  logger.info('Création d\'un code membre pour les tests...\n')
  
  // Récupérer PML Gabon
  const { data: school } = await supabase
    .from('schools')
    .select('id, name_fr')
    .eq('id', '7f081ca5-2e61-44dd-be1a-2cf43137f67f')
    .single()
  
  if (!school) {
    logger.error('❌ École PML non trouvée')
    return
  }
  
  // Créer un code membre pour PML promo 2000
  const code = `MEMBER-PML-2000-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  
  const { data, error } = await supabase
    .from('invitation_codes')
    .insert({
      code: code,
      school_id: school.id,
      entry_year: '2000',
      created_by_user_id: null,
      is_admin_code: false, // Code membre, pas admin
      max_uses: 10,
      current_uses: 0,
      expires_at: null,
      is_active: true
    })
    .select()
    .single()
  
  if (error) {
    logger.error('❌ Erreur:', error)
    return
  }
  
  logger.info('✅ Code membre créé avec succès!\n')
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  logger.info(`📋 Code: ${data.code}`)
  logger.info(`🏫 École: ${school.name_fr}`)
  logger.info(`📅 Promo: ${data.entry_year}`)
  logger.info(`🔒 Type: Membre (restrictions école/promo)`)
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  logger.info('💡 Pour les tests :\n')
  logger.info(`const MEMBER_CODE = '${data.code}'`)
  logger.info(`const MEMBER_CODE_SCHOOL_ID = '${data.school_id}'`)
  logger.info(`const MEMBER_CODE_ENTRY_YEAR = '${data.entry_year}'\n`)
}

createMemberCode()

