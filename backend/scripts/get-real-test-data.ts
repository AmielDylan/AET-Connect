import { supabase } from '../src/config/database'
import { logger } from '../src/utils/logger'

async function getRealTestData() {
  logger.info('Récupération des données réelles pour les tests...\n')
  
  // 1. Récupérer une école
  const { data: schools } = await supabase
    .from('schools')
    .select('id, name_fr, country')
    .limit(3)
  
  if (schools && schools.length > 0) {
    logger.info('📚 Écoles disponibles :')
    schools.forEach((s, i) => {
      logger.info(`   ${i + 1}. ${s.name_fr} (${s.country})`)
      logger.info(`      ID: ${s.id}\n`)
    })
  }
  
  // 2. Récupérer les codes admin
  const { data: codes } = await supabase
    .from('invitation_codes')
    .select('code, school_id, entry_year, is_admin_code')
    .eq('is_admin_code', true)
    .limit(5)
  
  if (codes && codes.length > 0) {
    logger.info('🎫 Codes d\'invitation admin disponibles :')
    codes.forEach((c, i) => {
      logger.info(`   ${i + 1}. Code: ${c.code}`)
      logger.info(`      School ID: ${c.school_id}`)
      logger.info(`      Entry Year: ${c.entry_year}\n`)
    })
  }
  
  // 3. Suggestion pour le test
  if (schools && schools[0] && codes && codes[0]) {
    logger.info('💡 Suggestion pour scripts/test-registration.ts :\n')
    logger.info('const TEST_SCHOOL_ID = \'' + schools[0].id + '\'')
    logger.info('const TEST_CODE = \'' + codes[0].code + '\'')
    logger.info('const TEST_CODE_SCHOOL_ID = \'' + codes[0].school_id + '\'')
    logger.info('const TEST_CODE_ENTRY_YEAR = \'' + codes[0].entry_year + '\'')
    logger.info('')
  }
}

getRealTestData()

