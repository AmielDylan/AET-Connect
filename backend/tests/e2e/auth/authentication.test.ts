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

async function runAuthTests() {
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  TESTS MODULE AUTH')
  logger.info('═══════════════════════════════════════════════════\n')
  
  let passed = 0
  let failed = 0
  
  let accessToken = ''
  let refreshToken = ''
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 1 : LOGIN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 1 : Login\n')
  
  // Test 1.1 : Login avec mauvais credentials
  logger.info('Test 1.1 : Login avec email/password incorrects')
  const test1_1 = await testAPI('/api/auth/login', 'POST', {
    email: 'wrongemail@test.com',
    password: 'WrongPassword123!'
  })
  
  if (test1_1.status === 401) {
    logger.info('✅ PASS - Credentials incorrects rejetés')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 401')
    failed++
  }
  logger.info('')
  
  // Test 1.2 : Login avec bons credentials
  logger.info('Test 1.2 : Login avec credentials corrects')
  const test1_2 = await testAPI('/api/auth/login', 'POST', {
    email: 'test.admin@aetconnect.com',
    password: 'TestPass123!'
  })
  
  if (test1_2.status === 200 && test1_2.data.access_token) {
    logger.info('✅ PASS - Login réussi')
    logger.info(`   User: ${test1_2.data.user.first_name} ${test1_2.data.user.last_name}`)
    logger.info(`   Role: ${test1_2.data.user.role}`)
    accessToken = test1_2.data.access_token
    refreshToken = test1_2.data.refresh_token
    passed++
  } else {
    logger.error('❌ FAIL - Login devrait réussir')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 2 : ROUTES PROTÉGÉES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 2 : Routes protégées\n')
  
  // Test 2.1 : Accès sans token
  logger.info('Test 2.1 : Accès /api/auth/me sans token')
  const test2_1 = await testAPI('/api/auth/me', 'GET')
  
  if (test2_1.status === 401) {
    logger.info('✅ PASS - Accès refusé sans token')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 401')
    failed++
  }
  logger.info('')
  
  // Test 2.2 : Accès avec token valide
  logger.info('Test 2.2 : Accès /api/auth/me avec token valide')
  const test2_2 = await testAPI('/api/auth/me', 'GET', null, accessToken)
  
  if (test2_2.status === 200 && test2_2.data.email) {
    logger.info('✅ PASS - Accès autorisé avec token')
    logger.info(`   User: ${test2_2.data.first_name} ${test2_2.data.last_name}`)
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 200')
    failed++
  }
  logger.info('')
  
  // Test 2.3 : Générer code avec token
  logger.info('Test 2.3 : Générer code d\'invitation avec token')
  const test2_3 = await testAPI('/api/codes/generate', 'POST', {}, accessToken)
  
  if (test2_3.status === 201 && test2_3.data.code) {
    logger.info('✅ PASS - Code généré avec token')
    logger.info(`   Code: ${test2_3.data.code}`)
    logger.info(`   Codes restants: ${test2_3.data.codes_remaining}`)
    passed++
  } else {
    logger.error('❌ FAIL - Génération devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 2.4 : Liste mes codes avec token
  logger.info('Test 2.4 : Lister mes codes avec token')
  const test2_4 = await testAPI('/api/codes/my-codes', 'GET', null, accessToken)
  
  if (test2_4.status === 200 && Array.isArray(test2_4.data.codes)) {
    logger.info('✅ PASS - Codes récupérés')
    logger.info(`   Total: ${test2_4.data.total} code(s)`)
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner la liste')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 3 : REFRESH TOKEN
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 3 : Refresh token\n')
  
  // Test 3.1 : Refresh avec token invalide
  logger.info('Test 3.1 : Refresh avec token invalide')
  const test3_1 = await testAPI('/api/auth/refresh', 'POST', {
    refresh_token: 'invalid-token-12345'
  })
  
  if (test3_1.status === 401) {
    logger.info('✅ PASS - Token invalide rejeté')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 401')
    failed++
  }
  logger.info('')
  
  // Test 3.2 : Refresh avec token valide
  logger.info('Test 3.2 : Refresh avec token valide')
  const test3_2 = await testAPI('/api/auth/refresh', 'POST', {
    refresh_token: refreshToken
  })
  
  if (test3_2.status === 200 && test3_2.data.access_token) {
    logger.info('✅ PASS - Nouveaux tokens générés')
    passed++
  } else {
    logger.error('❌ FAIL - Refresh devrait réussir')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 4 : LOGOUT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 4 : Logout\n')
  
  // Test 4.1 : Logout avec token
  logger.info('Test 4.1 : Logout avec token valide')
  const test4_1 = await testAPI('/api/auth/logout', 'POST', {}, accessToken)
  
  if (test4_1.status === 200) {
    logger.info('✅ PASS - Logout réussi')
    passed++
  } else {
    logger.error('❌ FAIL - Logout devrait réussir')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RÉSUMÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  RÉSULTATS TESTS AUTH')
  logger.info('═══════════════════════════════════════════════════\n')
  
  const total = passed + failed
  const percentage = Math.round((passed / total) * 100)
  
  logger.info(`Total tests    : ${total}`)
  logger.info(`Réussis        : ${passed} ✅`)
  logger.info(`Échoués        : ${failed} ❌`)
  logger.info(`Taux réussite  : ${percentage}%\n`)
  
  if (failed === 0) {
    logger.info('🎉 MODULE AUTH VALIDÉ!\n')
    logger.info('✓ Login fonctionnel')
    logger.info('✓ Routes protégées')
    logger.info('✓ JWT tokens valides')
    logger.info('✓ Refresh token OK')
    logger.info('✓ Logout fonctionnel\n')
  }
}

runAuthTests()

