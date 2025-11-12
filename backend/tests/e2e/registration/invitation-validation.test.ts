import { logger } from '../../../src/utils/logger'

const API_BASE = 'http://localhost:3001'

async function testAPI(endpoint: string, body: any) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return { status: res.status, data: await res.json() }
}

async function testInvitationLogic() {
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  TESTS LOGIQUE INVITATION - AET CONNECT')
  logger.info('═══════════════════════════════════════════════════\n')
  
  // IDs de test
  const SCHOOL_PML = '7f081ca5-2e61-44dd-be1a-2cf43137f67f' // PML Gabon
  const SCHOOL_BENIN = '27a770a1-9c36-48c8-8c6c-b2305d124c09' // Bénin
  const MEMBER_CODE_PML_2000 = 'MEMBER-PML-2000-GYHB' // Code membre pour PML promo 2000
  const ADMIN_CODE = 'ADMIN-UNIVERSAL-O8DU51' // Code admin universel créé
  
  let passed = 0
  let failed = 0
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 1 : CODES ADMIN UNIVERSELS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 1 : Codes admin universels\n')
  
  // Test 1.1: Code admin → PML 2022
  logger.info('Test 1.1 : Code admin universel → PML Gabon, promo 2022')
  const test1_1 = await testAPI('/api/register/verify-invitation-code', {
    code: ADMIN_CODE,
    school_id: SCHOOL_PML,
    entry_year: '2022'
  })
  
  if (test1_1.data.valid) {
    logger.info('✅ PASS - Code admin accepté pour n\'importe quelle école/promo')
    passed++
  } else {
    logger.error('❌ FAIL - Code admin devrait être valide')
    logger.error(`   Message: ${test1_1.data.message}`)
    failed++
  }
  logger.info('')
  
  // Test 1.2: Code admin → Bénin 2015
  logger.info('Test 1.2 : Code admin universel → Bénin, promo 2015')
  const test1_2 = await testAPI('/api/register/verify-invitation-code', {
    code: ADMIN_CODE,
    school_id: SCHOOL_BENIN,
    entry_year: '2015'
  })
  
  if (test1_2.data.valid) {
    logger.info('✅ PASS - Code admin accepté pour école différente')
    passed++
  } else {
    logger.error('❌ FAIL - Code admin devrait être valide')
    logger.error(`   Message: ${test1_2.data.message}`)
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 2 : CODES MEMBRES (BONS CAS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 2 : Codes membres - Cas valides\n')
  
  // Test 2.1: Code membre → Bonne école + Bonne promo
  logger.info('Test 2.1 : Code membre PML 2000 → PML 2000 (exact)')
  const test2_1 = await testAPI('/api/register/verify-invitation-code', {
    code: MEMBER_CODE_PML_2000,
    school_id: SCHOOL_PML,
    entry_year: '2000'
  })
  
  if (test2_1.data.valid) {
    logger.info('✅ PASS - Code membre accepté pour école/promo correcte')
    passed++
  } else {
    logger.error('❌ FAIL - Code devrait être valide')
    logger.error(`   Message: ${test2_1.data.message}`)
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 3 : CODES MEMBRES (MAUVAIS CAS)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 3 : Codes membres - Cas rejetés\n')
  
  // Test 3.1: Code membre → Bonne école + Mauvaise promo
  logger.info('Test 3.1 : Code membre PML 2000 → PML 2022 (mauvaise promo)')
  const test3_1 = await testAPI('/api/register/verify-invitation-code', {
    code: MEMBER_CODE_PML_2000,
    school_id: SCHOOL_PML,
    entry_year: '2022'
  })
  
  if (!test3_1.data.valid) {
    logger.info('✅ PASS (rejeté comme attendu)')
    logger.info(`   Message utilisateur: "${test3_1.data.message}"`)
    passed++
  } else {
    logger.error('❌ FAIL - Code devrait être rejeté (mauvaise promo)')
    failed++
  }
  logger.info('')
  
  // Test 3.2: Code membre → Mauvaise école + Bonne promo
  logger.info('Test 3.2 : Code membre PML 2000 → Bénin 2000 (mauvaise école)')
  const test3_2 = await testAPI('/api/register/verify-invitation-code', {
    code: MEMBER_CODE_PML_2000,
    school_id: SCHOOL_BENIN,
    entry_year: '2000'
  })
  
  if (!test3_2.data.valid) {
    logger.info('✅ PASS (rejeté comme attendu)')
    logger.info(`   Message utilisateur: "${test3_2.data.message}"`)
    passed++
  } else {
    logger.error('❌ FAIL - Code devrait être rejeté (mauvaise école)')
    failed++
  }
  logger.info('')
  
  // Test 3.3: Code membre → Mauvaise école + Mauvaise promo
  logger.info('Test 3.3 : Code membre PML 2000 → Bénin 2022 (tout faux)')
  const test3_3 = await testAPI('/api/register/verify-invitation-code', {
    code: MEMBER_CODE_PML_2000,
    school_id: SCHOOL_BENIN,
    entry_year: '2022'
  })
  
  if (!test3_3.data.valid) {
    logger.info('✅ PASS (rejeté comme attendu)')
    logger.info(`   Message utilisateur: "${test3_3.data.message}"`)
    passed++
  } else {
    logger.error('❌ FAIL - Code devrait être rejeté')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 4 : CAS D'ERREUR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 4 : Cas d\'erreur\n')
  
  // Test 4.1: Code invalide
  logger.info('Test 4.1 : Code inexistant')
  const test4_1 = await testAPI('/api/register/verify-invitation-code', {
    code: 'CODE-INVALIDE-123',
    school_id: SCHOOL_PML,
    entry_year: '2022'
  })
  
  if (!test4_1.data.valid) {
    logger.info('✅ PASS (rejeté comme attendu)')
    logger.info(`   Message utilisateur: "${test4_1.data.message}"`)
    passed++
  } else {
    logger.error('❌ FAIL - Code invalide devrait être rejeté')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RÉSUMÉ FINAL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  RÉSULTATS FINAUX')
  logger.info('═══════════════════════════════════════════════════\n')
  
  const total = passed + failed
  const percentage = Math.round((passed / total) * 100)
  
  logger.info(`Total tests    : ${total}`)
  logger.info(`Réussis        : ${passed} ✅`)
  logger.info(`Échoués        : ${failed} ❌`)
  logger.info(`Taux réussite  : ${percentage}%\n`)
  
  if (failed === 0) {
    logger.info('🎉 LOGIQUE D\'INVITATION VALIDÉE!\n')
    logger.info('✓ Codes admin universels fonctionnent')
    logger.info('✓ Codes membres respectent les restrictions école/promo')
    logger.info('✓ Messages utilisateur sont clairs et guidants\n')
  } else {
    logger.warn('⚠️  Des corrections sont nécessaires\n')
  }
}

testInvitationLogic()

