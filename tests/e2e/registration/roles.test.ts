import { supabase } from '../../../src/config/database'
import { logger } from '../../../src/utils/logger'

const API_BASE = 'http://localhost:3001'

async function testAPI(endpoint: string, method: string, body?: any, token?: string) {
  const headers: any = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
  return { status: res.status, data: await res.json() }
}

async function loginUser(email: string, password: string): Promise<string | null> {
  const res = await testAPI('/api/auth/login', 'POST', { email, password })
  return res.data.access_token || null
}

interface TestResult {
  group: string
  test: string
  status: 'PASS' | 'FAIL'
  message: string
  details?: any
}

const results: TestResult[] = []

async function runAllRolesTests() {
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  TESTS COMPLETS - TOUS LES RÔLES')
  logger.info('═══════════════════════════════════════════════════\n')
  
  // Récupérer les utilisateurs de test
  const { data: member } = await supabase
    .from('users')
    .select('id, email, max_codes_allowed')
    .eq('email', 'test.membre@aetconnect.com')
    .single()
  
  const { data: ambassador } = await supabase
    .from('users')
    .select('id, email, max_codes_allowed')
    .eq('email', 'test.ambassadeur@aetconnect.com')
    .single()
  
  const { data: admin } = await supabase
    .from('users')
    .select('id, email, max_codes_allowed')
    .eq('email', 'test.admin@aetconnect.com')
    .single()
  
  if (!member || !ambassador || !admin) {
    logger.error('❌ Utilisateurs de test non trouvés. Exécuter npm run setup:test-users')
    return
  }
  
  logger.info('Utilisateurs de test trouvés :')
  logger.info(`  Membre : ${member.email} (${member.max_codes_allowed} codes max)`)
  logger.info(`  Ambassadeur : ${ambassador.email} (${ambassador.max_codes_allowed} codes max)`)
  logger.info(`  Admin : ${admin.email} (${admin.max_codes_allowed} codes max)`)
  logger.info('')
  
  // Obtenir les tokens JWT pour chaque utilisateur
  logger.info('🔐 Authentification des utilisateurs...')
  const memberToken = await loginUser('test.membre@aetconnect.com', 'TestPass123!')
  const ambassadorToken = await loginUser('test.ambassadeur@aetconnect.com', 'TestPass123!')
  const adminToken = await loginUser('test.admin@aetconnect.com', 'TestPass123!')
  
  if (!memberToken || !ambassadorToken || !adminToken) {
    logger.error('❌ Échec authentification des utilisateurs de test')
    return
  }
  logger.info('✅ Tous les utilisateurs authentifiés\n')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 1 : GÉNÉRATION DE CODES - MEMBRE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 1 : Génération codes - Membre normal\n')
  
  // Test 1.1 : Membre génère 3 codes (max)
  logger.info('Test 1.1 : Membre génère 3 codes (sa limite)')
  
  let memberCodesGenerated = 0
  for (let i = 1; i <= 3; i++) {
    const result = await testAPI('/api/codes/generate', 'POST', {}, memberToken)
    
    if (result.data.success) {
      memberCodesGenerated++
      logger.info(`   Code ${i}/3 généré : ${result.data.code} ✓`)
    } else {
      logger.error(`   Code ${i}/3 échoué ✗`)
    }
  }
  
  if (memberCodesGenerated === 3) {
    logger.info('✅ PASS - Membre a généré 3 codes')
    results.push({
      group: 'Génération codes - Membre',
      test: 'Générer 3 codes (limite)',
      status: 'PASS',
      message: '3/3 codes générés avec succès'
    })
  } else {
    logger.error('❌ FAIL - Échec génération')
    results.push({
      group: 'Génération codes - Membre',
      test: 'Générer 3 codes (limite)',
      status: 'FAIL',
      message: `Seulement ${memberCodesGenerated}/3 codes générés`
    })
  }
  logger.info('')
  
  // Test 1.2 : Membre tente 4ème code (devrait échouer)
  logger.info('Test 1.2 : Membre tente 4ème code (devrait échouer)')
  const test1_2 = await testAPI('/api/codes/generate', 'POST', {}, memberToken)
  
  if (!test1_2.data.success && test1_2.data.error?.includes('limite')) {
    logger.info('✅ PASS - 4ème code rejeté')
    logger.info(`   Message : "${test1_2.data.error}"`)
    results.push({
      group: 'Génération codes - Membre',
      test: '4ème code rejeté',
      status: 'PASS',
      message: 'Limite de 3 codes respectée'
    })
  } else {
    logger.error('❌ FAIL - 4ème code devrait être rejeté')
    results.push({
      group: 'Génération codes - Membre',
      test: '4ème code rejeté',
      status: 'FAIL',
      message: '4ème code ne devrait pas être accepté'
    })
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 2 : GÉNÉRATION DE CODES - AMBASSADEUR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 2 : Génération codes - Ambassadeur\n')
  
  // Test 2.1 : Ambassadeur génère 20 codes (max)
  logger.info('Test 2.1 : Ambassadeur génère 20 codes (sa limite)')
  
  let ambassadorCodesGenerated = 0
  for (let i = 1; i <= 20; i++) {
    const result = await testAPI('/api/codes/generate', 'POST', {}, ambassadorToken)
    
    if (result.data.success) {
      ambassadorCodesGenerated++
    }
  }
  
  logger.info(`   ${ambassadorCodesGenerated}/20 codes générés`)
  
  if (ambassadorCodesGenerated === 20) {
    logger.info('✅ PASS - Ambassadeur a généré 20 codes')
    results.push({
      group: 'Génération codes - Ambassadeur',
      test: 'Générer 20 codes (limite)',
      status: 'PASS',
      message: '20/20 codes générés avec succès'
    })
  } else {
    logger.error('❌ FAIL - Échec génération')
    results.push({
      group: 'Génération codes - Ambassadeur',
      test: 'Générer 20 codes (limite)',
      status: 'FAIL',
      message: `Seulement ${ambassadorCodesGenerated}/20 codes générés`
    })
  }
  logger.info('')
  
  // Test 2.2 : Ambassadeur tente 21ème code
  logger.info('Test 2.2 : Ambassadeur tente 21ème code (devrait échouer)')
  const test2_2 = await testAPI('/api/codes/generate', 'POST', {}, ambassadorToken)
  
  if (!test2_2.data.success && test2_2.data.error?.includes('limite')) {
    logger.info('✅ PASS - 21ème code rejeté')
    results.push({
      group: 'Génération codes - Ambassadeur',
      test: '21ème code rejeté',
      status: 'PASS',
      message: 'Limite de 20 codes respectée'
    })
  } else {
    logger.error('❌ FAIL - 21ème code devrait être rejeté')
    results.push({
      group: 'Génération codes - Ambassadeur',
      test: '21ème code rejeté',
      status: 'FAIL',
      message: '21ème code ne devrait pas être accepté'
    })
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 3 : GÉNÉRATION DE CODES - ADMIN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 3 : Génération codes - Admin AET Connect\n')
  
  // Test 3.1 : Admin génère 50 codes (pas de limite)
  logger.info('Test 3.1 : Admin génère 50 codes (aucune limite)')
  
  let adminCodesGenerated = 0
  for (let i = 1; i <= 50; i++) {
    const result = await testAPI('/api/codes/generate', 'POST', {}, adminToken)
    
    if (result.data.success) {
      adminCodesGenerated++
    }
  }
  
  logger.info(`   ${adminCodesGenerated}/50 codes générés`)
  
  if (adminCodesGenerated === 50) {
    logger.info('✅ PASS - Admin a généré 50 codes sans limite')
    results.push({
      group: 'Génération codes - Admin',
      test: 'Générer 50 codes (illimité)',
      status: 'PASS',
      message: '50/50 codes générés, aucune limite appliquée'
    })
  } else {
    logger.error('❌ FAIL - Admin devrait pouvoir générer 50 codes')
    results.push({
      group: 'Génération codes - Admin',
      test: 'Générer 50 codes (illimité)',
      status: 'FAIL',
      message: `Seulement ${adminCodesGenerated}/50 codes générés`
    })
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 4 : CODES GÉNÉRÉS PAR MEMBRES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 4 : Restriction codes membres vs admin\n')
  
  // Récupérer un code généré par un membre
  const { data: memberCode } = await supabase
    .from('invitation_codes')
    .select('*')
    .eq('created_by_user_id', member.id)
    .eq('is_admin_code', false)
    .limit(1)
    .single()
  
  if (!memberCode) {
    logger.warn('⚠️  Aucun code membre trouvé, skip test 4.1')
    results.push({
      group: 'Codes membres',
      test: 'Restriction école/promo',
      status: 'FAIL',
      message: 'Aucun code membre disponible pour test'
    })
  } else {
    // Test 4.1 : Code membre avec bonne école/promo
    logger.info('Test 4.1 : Code membre avec école/promo correcte')
    const test4_1 = await testAPI('/api/register/verify-invitation-code', 'POST', {
      code: memberCode.code,
      school_id: memberCode.school_id,
      entry_year: memberCode.entry_year
    })
    
    if (test4_1.data.valid) {
      logger.info('✅ PASS - Code membre valide pour sa promo')
      results.push({
        group: 'Codes membres',
        test: 'Code valide pour sa promo',
        status: 'PASS',
        message: 'Code accepté pour école/promo correcte'
      })
    } else {
      logger.error('❌ FAIL - Code membre devrait être valide')
      results.push({
        group: 'Codes membres',
        test: 'Code valide pour sa promo',
        status: 'FAIL',
        message: 'Code rejeté alors qu\'école/promo correctes'
      })
    }
    logger.info('')
    
    // Test 4.2 : Code membre avec mauvaise promo
    logger.info('Test 4.2 : Code membre avec mauvaise promo')
    const test4_2 = await testAPI('/api/register/verify-invitation-code', 'POST', {
      code: memberCode.code,
      school_id: memberCode.school_id,
      entry_year: '2099' // Mauvaise année
    })
    
    if (!test4_2.data.valid) {
      logger.info('✅ PASS - Code membre rejeté pour mauvaise promo')
      results.push({
        group: 'Codes membres',
        test: 'Rejeté pour mauvaise promo',
        status: 'PASS',
        message: 'Code correctement rejeté'
      })
    } else {
      logger.error('❌ FAIL - Code devrait être rejeté')
      results.push({
        group: 'Codes membres',
        test: 'Rejeté pour mauvaise promo',
        status: 'FAIL',
        message: 'Code accepté alors que promo incorrecte'
      })
    }
    logger.info('')
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 5 : CODES ADMIN UNIVERSELS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 5 : Codes admin universels\n')
  
  // Récupérer un code admin
  const { data: adminCode } = await supabase
    .from('invitation_codes')
    .select('*')
    .eq('is_admin_code', true)
    .limit(1)
    .single()
  
  if (!adminCode) {
    logger.warn('⚠️  Aucun code admin trouvé, skip groupe 5')
  } else {
    // Récupérer 2 écoles différentes
    const { data: schools } = await supabase
      .from('schools')
      .select('id')
      .limit(2)
    
    // Test 5.1 : Code admin → École 1
    logger.info('Test 5.1 : Code admin pour école 1, promo 2015')
    const test5_1 = await testAPI('/api/register/verify-invitation-code', 'POST', {
      code: adminCode.code,
      school_id: schools![0].id,
      entry_year: '2015'
    })
    
    if (test5_1.data.valid) {
      logger.info('✅ PASS - Code admin valide pour n\'importe quelle école/promo')
      results.push({
        group: 'Codes admin',
        test: 'Valide pour école 1',
        status: 'PASS',
        message: 'Code admin accepté'
      })
    } else {
      logger.error('❌ FAIL - Code admin devrait être valide')
      results.push({
        group: 'Codes admin',
        test: 'Valide pour école 1',
        status: 'FAIL',
        message: 'Code admin rejeté alors qu\'il devrait être universel'
      })
    }
    logger.info('')
    
    // Test 5.2 : Code admin → École 2
    logger.info('Test 5.2 : Code admin pour école 2, promo 2018')
    const test5_2 = await testAPI('/api/register/verify-invitation-code', 'POST', {
      code: adminCode.code,
      school_id: schools![1].id,
      entry_year: '2018'
    })
    
    if (test5_2.data.valid) {
      logger.info('✅ PASS - Code admin valide pour autre école')
      results.push({
        group: 'Codes admin',
        test: 'Valide pour école 2',
        status: 'PASS',
        message: 'Code admin accepté pour école différente'
      })
    } else {
      logger.error('❌ FAIL - Code admin devrait être valide')
      results.push({
        group: 'Codes admin',
        test: 'Valide pour école 2',
        status: 'FAIL',
        message: 'Code admin rejeté pour école différente'
      })
    }
    logger.info('')
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RÉSUMÉ FINAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  RÉSULTATS FINAUX - TOUS LES RÔLES')
  logger.info('═══════════════════════════════════════════════════\n')
  
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const total = results.length
  const percentage = Math.round((passed / total) * 100)
  
  logger.info(`Total tests    : ${total}`)
  logger.info(`Réussis        : ${passed} ✅`)
  logger.info(`Échoués        : ${failed} ❌`)
  logger.info(`Taux réussite  : ${percentage}%\n`)
  
  // Détail par groupe
  const groups = [...new Set(results.map(r => r.group))]
  groups.forEach(group => {
    const groupResults = results.filter(r => r.group === group)
    const groupPassed = groupResults.filter(r => r.status === 'PASS').length
    logger.info(`${group}: ${groupPassed}/${groupResults.length} ✓`)
  })
  
  logger.info('')
  
  if (failed === 0) {
    logger.info('🎉 TOUS LES TESTS PASSENT!\n')
  } else {
    logger.warn('⚠️  Des corrections sont nécessaires\n')
  }
  
  return results
}

runAllRolesTests()

