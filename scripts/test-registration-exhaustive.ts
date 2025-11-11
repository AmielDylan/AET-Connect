import { supabase } from '../src/config/database'
import { logger } from '../src/utils/logger'

const API_BASE = 'http://localhost:3001'

async function testAPI(endpoint: string, method: string, body?: any) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
  return { status: res.status, data: await res.json() }
}

async function runExhaustiveTests() {
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  TESTS EXHAUSTIFS - MODULE REGISTRATION')
  logger.info('═══════════════════════════════════════════════════\n')
  
  let passed = 0
  let failed = 0
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 1 : MAX USES DES CODES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 1 : Nombre maximum d\'utilisations\n')
  
  // Test 1.1 : Créer un code avec max_uses = 1
  logger.info('Test 1.1 : Créer code avec max_uses = 1')
  
  const { data: school } = await supabase
    .from('schools')
    .select('id')
    .limit(1)
    .single()
  
  const { data: testCode } = await supabase
    .from('invitation_codes')
    .insert({
      code: 'TEST-MAX-1-' + Math.random().toString(36).substring(7),
      school_id: school!.id,
      entry_year: '2000',
      is_admin_code: false,
      max_uses: 1,
      current_uses: 0,
      is_active: true
    })
    .select()
    .single()
  
  logger.info(`   Code créé : ${testCode!.code}`)
  logger.info('')
  
  // Test 1.2 : Première inscription (devrait passer)
  logger.info('Test 1.2 : Première inscription avec ce code')
  const test1_2 = await testAPI('/api/register/complete-registration', 'POST', {
    invitation_code: testCode!.code,
    first_name: 'Test',
    last_name: 'MaxUses1',
    email: `test.maxuses1.${Date.now()}@example.com`,
    password: 'SecurePass123!'
  })
  
  if (test1_2.data.success) {
    logger.info('✅ PASS - Première inscription réussie')
    passed++
  } else {
    logger.error('❌ FAIL - Première inscription devrait passer')
    logger.error(`   Erreur : ${test1_2.data.error}`)
    failed++
  }
  logger.info('')
  
  // Test 1.3 : Deuxième inscription (devrait échouer)
  logger.info('Test 1.3 : Deuxième inscription avec ce code (devrait échouer)')
  const test1_3 = await testAPI('/api/register/verify-invitation-code', 'POST', {
    code: testCode!.code,
    school_id: school!.id,
    entry_year: '2000'
  })
  
  if (!test1_3.data.valid && test1_3.data.message.includes('maximum')) {
    logger.info('✅ PASS - Code rejeté (max uses atteint)')
    logger.info(`   Message : "${test1_3.data.message}"`)
    passed++
  } else {
    logger.error('❌ FAIL - Code devrait être rejeté')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 2 : UNICITÉ EMAIL
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 2 : Unicité des emails\n')
  
  // Créer un code pour les tests
  const { data: testCode2 } = await supabase
    .from('invitation_codes')
    .insert({
      code: 'TEST-EMAIL-' + Math.random().toString(36).substring(7),
      school_id: school!.id,
      entry_year: '2001',
      is_admin_code: false,
      max_uses: 10,
      current_uses: 0,
      is_active: true
    })
    .select()
    .single()
  
  const testEmail = `test.unique.${Date.now()}@example.com`
  
  // Test 2.1 : Première inscription avec email
  logger.info('Test 2.1 : Première inscription avec email unique')
  const test2_1 = await testAPI('/api/register/complete-registration', 'POST', {
    invitation_code: testCode2!.code,
    first_name: 'Test',
    last_name: 'Unique1',
    email: testEmail,
    password: 'SecurePass123!'
  })
  
  if (test2_1.data.success) {
    logger.info('✅ PASS - Première inscription OK')
    passed++
  } else {
    logger.error('❌ FAIL - Inscription devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 2.2 : Deuxième inscription avec même email (devrait échouer)
  logger.info('Test 2.2 : Tentative avec email déjà utilisé (devrait échouer)')
  const test2_2 = await testAPI('/api/register/complete-registration', 'POST', {
    invitation_code: testCode2!.code,
    first_name: 'Test',
    last_name: 'Unique2',
    email: testEmail, // Même email
    password: 'SecurePass123!'
  })
  
  if (!test2_2.data.success && test2_2.data.error?.includes('email')) {
    logger.info('✅ PASS - Email dupliqué rejeté')
    logger.info(`   Message : "${test2_2.data.error}"`)
    passed++
  } else {
    logger.error('❌ FAIL - Email dupliqué devrait être rejeté')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 3 : CODE EXPIRÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 3 : Codes expirés\n')
  
  // Test 3.1 : Créer un code expiré
  logger.info('Test 3.1 : Créer code avec expiration passée')
  const { data: expiredCode } = await supabase
    .from('invitation_codes')
    .insert({
      code: 'TEST-EXPIRED-' + Math.random().toString(36).substring(7),
      school_id: school!.id,
      entry_year: '2002',
      is_admin_code: false,
      max_uses: 10,
      current_uses: 0,
      expires_at: new Date(Date.now() - 86400000).toISOString(), // Hier
      is_active: true
    })
    .select()
    .single()
  
  logger.info(`   Code créé : ${expiredCode!.code}`)
  logger.info(`   Expiré le : ${expiredCode!.expires_at}`)
  logger.info('')
  
  // Test 3.2 : Vérifier code expiré
  logger.info('Test 3.2 : Vérifier code expiré (devrait échouer)')
  const test3_2 = await testAPI('/api/register/verify-invitation-code', 'POST', {
    code: expiredCode!.code,
    school_id: school!.id,
    entry_year: '2002'
  })
  
  if (!test3_2.data.valid && test3_2.data.message.includes('expiré')) {
    logger.info('✅ PASS - Code expiré rejeté')
    logger.info(`   Message : "${test3_2.data.message}"`)
    passed++
  } else {
    logger.error('❌ FAIL - Code expiré devrait être rejeté')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 4 : CODE INACTIF
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 4 : Codes inactifs\n')
  
  // Test 4.1 : Créer un code inactif
  logger.info('Test 4.1 : Créer code inactif')
  const { data: inactiveCode } = await supabase
    .from('invitation_codes')
    .insert({
      code: 'TEST-INACTIVE-' + Math.random().toString(36).substring(7),
      school_id: school!.id,
      entry_year: '2003',
      is_admin_code: false,
      max_uses: 10,
      current_uses: 0,
      is_active: false // Inactif
    })
    .select()
    .single()
  
  logger.info(`   Code créé : ${inactiveCode!.code}`)
  logger.info('')
  
  // Test 4.2 : Vérifier code inactif
  logger.info('Test 4.2 : Vérifier code inactif (devrait échouer)')
  const test4_2 = await testAPI('/api/register/verify-invitation-code', 'POST', {
    code: inactiveCode!.code,
    school_id: school!.id,
    entry_year: '2003'
  })
  
  if (!test4_2.data.valid) {
    logger.info('✅ PASS - Code inactif rejeté')
    logger.info(`   Message : "${test4_2.data.message}"`)
    passed++
  } else {
    logger.error('❌ FAIL - Code inactif devrait être rejeté')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 5 : INCRÉMENTATION CURRENT_USES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 5 : Incrémentation current_uses\n')
  
  // Test 5.1 : Créer code avec max_uses = 3
  const { data: testCode5 } = await supabase
    .from('invitation_codes')
    .insert({
      code: 'TEST-INCREMENT-' + Math.random().toString(36).substring(7),
      school_id: school!.id,
      entry_year: '2004',
      is_admin_code: false,
      max_uses: 3,
      current_uses: 0,
      is_active: true
    })
    .select()
    .single()
  
  logger.info('Test 5.1 : Créer 3 utilisateurs avec code max_uses=3')
  
  for (let i = 1; i <= 3; i++) {
    const result = await testAPI('/api/register/complete-registration', 'POST', {
      invitation_code: testCode5!.code,
      first_name: 'Test',
      last_name: `Increment${i}`,
      email: `test.increment${i}.${Date.now()}.${i}@example.com`,
      password: 'SecurePass123!'
    })
    
    if (result.data.success) {
      logger.info(`   Utilisateur ${i}/3 créé ✓`)
    } else {
      logger.error(`   Utilisateur ${i}/3 échoué ✗`)
    }
  }
  
  // Vérifier current_uses en DB
  const { data: codeCheck } = await supabase
    .from('invitation_codes')
    .select('current_uses')
    .eq('code', testCode5!.code)
    .single()
  
  if (codeCheck?.current_uses === 3) {
    logger.info('✅ PASS - current_uses incrémenté correctement (3/3)')
    passed++
  } else {
    logger.error(`❌ FAIL - current_uses devrait être 3, reçu ${codeCheck?.current_uses}`)
    failed++
  }
  logger.info('')
  
  // Test 5.2 : 4ème tentative (devrait échouer)
  logger.info('Test 5.2 : 4ème tentative (devrait échouer, max atteint)')
  const test5_2 = await testAPI('/api/register/verify-invitation-code', 'POST', {
    code: testCode5!.code,
    school_id: school!.id,
    entry_year: '2004'
  })
  
  if (!test5_2.data.valid && test5_2.data.message.includes('maximum')) {
    logger.info('✅ PASS - 4ème tentative rejetée')
    logger.info(`   Message : "${test5_2.data.message}"`)
    passed++
  } else {
    logger.error('❌ FAIL - 4ème tentative devrait être rejetée')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RÉSUMÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  RÉSULTATS TESTS EXHAUSTIFS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  const total = passed + failed
  const percentage = Math.round((passed / total) * 100)
  
  logger.info(`Total tests    : ${total}`)
  logger.info(`Réussis        : ${passed} ✅`)
  logger.info(`Échoués        : ${failed} ❌`)
  logger.info(`Taux réussite  : ${percentage}%\n`)
  
  if (failed === 0) {
    logger.info('🎉 TOUS LES TESTS EXHAUSTIFS PASSENT!\n')
    logger.info('✓ Max uses respecté')
    logger.info('✓ Unicité email validée')
    logger.info('✓ Codes expirés rejetés')
    logger.info('✓ Codes inactifs rejetés')
    logger.info('✓ current_uses incrémenté correctement\n')
  } else {
    logger.warn('⚠️  Des corrections sont nécessaires\n')
  }
}

runExhaustiveTests()

