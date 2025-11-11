import { supabase } from '../src/config/database'
import { logger } from '../src/utils/logger'

async function getMemberCodes() {
  logger.info('Récupération des codes membres (non-admin)...\n')
  
  // Récupérer les codes membres (non-admin)
  const { data: codes } = await supabase
    .from('invitation_codes')
    .select('code, school_id, entry_year, is_admin_code, max_uses, current_uses')
    .eq('is_admin_code', false)
    .eq('is_active', true)
    .limit(5)
  
  if (codes && codes.length > 0) {
    logger.info('🎫 Codes membres disponibles :')
    codes.forEach((c, i) => {
      logger.info(`   ${i + 1}. Code: ${c.code}`)
      logger.info(`      School ID: ${c.school_id}`)
      logger.info(`      Entry Year: ${c.entry_year}`)
      logger.info(`      Utilisations: ${c.current_uses}/${c.max_uses}\n`)
    })
    
    if (codes[0]) {
      logger.info('💡 Code membre pour les tests :\n')
      logger.info(`const MEMBER_CODE = '${codes[0].code}'`)
      logger.info(`const MEMBER_CODE_SCHOOL_ID = '${codes[0].school_id}'`)
      logger.info(`const MEMBER_CODE_ENTRY_YEAR = '${codes[0].entry_year}'\n`)
    }
  } else {
    logger.warn('⚠️  Aucun code membre trouvé. Il faudra en créer un pour tester les restrictions.\n')
  }
}

getMemberCodes()

