import { supabase } from '../src/config/database'
import { logger } from '../src/utils/logger'

async function createAdminUniversalCode() {
  logger.info('Création d\'un code admin universel...\n')
  
  // Générer un code aléatoire
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
  const code = `ADMIN-UNIVERSAL-${randomPart}`
  
  // Récupérer la première école (valeur technique, non utilisée pour codes admin)
  const { data: school } = await supabase
    .from('schools')
    .select('id, name_fr')
    .limit(1)
    .single()
  
  if (!school) {
    logger.error('❌ Aucune école trouvée dans la base')
    return
  }
  
  // Créer le code admin universel
  const { data, error } = await supabase
    .from('invitation_codes')
    .insert({
      code: code,
      school_id: school.id, // Valeur technique (ignorée car is_admin_code = true)
      entry_year: '00', // Valeur technique (ignorée car is_admin_code = true)
      created_by_user_id: null,
      is_admin_code: true,
      max_uses: 1000, // Nombre élevé d'utilisations
      current_uses: 0,
      expires_at: null, // Pas d'expiration
      is_active: true
    })
    .select()
    .single()
  
  if (error) {
    logger.error('❌ Erreur lors de la création du code:', error)
    return
  }
  
  logger.info('✅ Code admin universel créé avec succès!\n')
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  logger.info(`📋 Code: ${data.code}`)
  logger.info(`🔢 Utilisations max: ${data.max_uses}`)
  logger.info(`🌍 Valide pour: TOUTES les écoles et promotions`)
  logger.info(`📅 Expiration: Aucune`)
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  logger.info(`\n🔗 Lien d'invitation:`)
  logger.info(`   https://aetconnect.com/register?code=${data.code}\n`)
}

createAdminUniversalCode()

