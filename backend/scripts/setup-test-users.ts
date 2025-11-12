import { supabase } from '../src/config/database'
import { logger } from '../src/utils/logger'
import bcrypt from 'bcrypt'

async function setupTestUsers() {
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  CRÉATION UTILISATEURS DE TEST')
  logger.info('═══════════════════════════════════════════════════\n')
  
  // Récupérer une école
  const { data: school } = await supabase
    .from('schools')
    .select('id, name_fr')
    .limit(1)
    .single()
  
  if (!school) {
    logger.error('❌ Aucune école trouvée')
    return
  }
  
  logger.info(`École utilisée : ${school.name_fr}\n`)
  
  const password_hash = await bcrypt.hash('TestPass123!', 10)
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. MEMBRE NORMAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('1. Création MEMBRE NORMAL')
  const { data: member, error: memberError } = await supabase
    .from('users')
    .upsert({
      email: 'test.membre@aetconnect.com',
      password_hash,
      first_name: 'Jean',
      last_name: 'Membre',
      school_id: school.id,
      entry_year: '2020',
      role: 'alumni',
      is_ambassador: false,
      max_codes_allowed: 3,
      is_active: true
    }, { onConflict: 'email' })
    .select()
    .single()
  
  if (memberError) {
    logger.error('❌ Erreur création membre:', memberError.message)
  } else {
    logger.info('✅ Membre créé')
    logger.info(`   ID: ${member.id}`)
    logger.info(`   Email: ${member.email}`)
    logger.info(`   Codes max: ${member.max_codes_allowed}`)
    logger.info('')
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. AMBASSADEUR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('2. Création AMBASSADEUR')
  const { data: ambassador, error: ambassadorError } = await supabase
    .from('users')
    .upsert({
      email: 'test.ambassadeur@aetconnect.com',
      password_hash,
      first_name: 'Marie',
      last_name: 'Ambassadeur',
      school_id: school.id,
      entry_year: '2021',
      role: 'alumni',
      is_ambassador: true,
      max_codes_allowed: 20,
      is_active: true
    }, { onConflict: 'email' })
    .select()
    .single()
  
  if (ambassadorError) {
    logger.error('❌ Erreur création ambassadeur:', ambassadorError.message)
  } else {
    logger.info('✅ Ambassadeur créé')
    logger.info(`   ID: ${ambassador.id}`)
    logger.info(`   Email: ${ambassador.email}`)
    logger.info(`   Codes max: ${ambassador.max_codes_allowed}`)
    logger.info('')
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. ADMIN AET CONNECT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('3. Création ADMIN AET CONNECT')
  const { data: admin, error: adminError } = await supabase
    .from('users')
    .upsert({
      email: 'test.admin@aetconnect.com',
      password_hash,
      first_name: 'Paul',
      last_name: 'Admin',
      school_id: school.id,
      entry_year: '2019',
      role: 'admin',
      is_ambassador: false,
      max_codes_allowed: 999999,
      is_active: true
    }, { onConflict: 'email' })
    .select()
    .single()
  
  if (adminError) {
    logger.error('❌ Erreur création admin:', adminError.message)
  } else {
    logger.info('✅ Admin créé')
    logger.info(`   ID: ${admin.id}`)
    logger.info(`   Email: ${admin.email}`)
    logger.info(`   Codes max: ${admin.max_codes_allowed}`)
    logger.info('')
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RÉSUMÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  UTILISATEURS DE TEST CRÉÉS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  logger.info('📋 Utilisateurs disponibles :')
  logger.info('')
  logger.info('1. MEMBRE NORMAL')
  logger.info(`   ID: ${member?.id || 'N/A'}`)
  logger.info('   Email: test.membre@aetconnect.com')
  logger.info('   Password: TestPass123!')
  logger.info('   Codes max: 3')
  logger.info('')
  logger.info('2. AMBASSADEUR')
  logger.info(`   ID: ${ambassador?.id || 'N/A'}`)
  logger.info('   Email: test.ambassadeur@aetconnect.com')
  logger.info('   Password: TestPass123!')
  logger.info('   Codes max: 20')
  logger.info('')
  logger.info('3. ADMIN AET CONNECT')
  logger.info(`   ID: ${admin?.id || 'N/A'}`)
  logger.info('   Email: test.admin@aetconnect.com')
  logger.info('   Password: TestPass123!')
  logger.info('   Codes max: Illimité')
  logger.info('')
}

setupTestUsers()

