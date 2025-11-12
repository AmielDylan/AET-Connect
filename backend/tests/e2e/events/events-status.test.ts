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

async function runStatusTests() {
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  TESTS STATUS ET DATES - MODULE EVENTS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  let passed = 0
  let failed = 0
  
  let adminToken = ''
  let adminUserId = ''
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SETUP : Login
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('🔐 SETUP : Authentification\n')
  
  const login = await testAPI('/api/auth/login', 'POST', {
    email: 'test.admin@aetconnect.com',
    password: 'TestPass123!'
  })
  
  if (login.data.access_token) {
    adminToken = login.data.access_token
    adminUserId = login.data.user.id
    logger.info('✅ Authentification réussie\n')
  } else {
    logger.error('❌ Authentification échouée')
    return
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 1 : VALIDATION DATES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 1 : Validation dates\n')
  
  // Test 1.1 : Créer événement avec event_end_date avant event_date
  logger.info('Test 1.1 : Date fin avant date début (devrait échouer)')
  const test1_1 = await testAPI('/api/events', 'POST', {
    title: 'Événement dates invalides',
    event_date: '2026-12-01T18:00:00Z',
    event_end_date: '2026-12-01T17:00:00Z', // Avant event_date
    city: 'Paris',
    country: 'France'
  }, adminToken)
  
  if (test1_1.status === 400) {
    logger.info('✅ PASS - Dates invalides rejetées')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait rejeter dates invalides')
    failed++
  }
  logger.info('')
  
  // Test 1.2 : Créer événement valide avec dates correctes
  logger.info('Test 1.2 : Créer événement avec dates valides')
  const test1_2 = await testAPI('/api/events', 'POST', {
    title: 'Événement avec dates - Test Status',
    event_date: '2026-12-01T18:00:00Z',
    event_end_date: '2026-12-01T21:00:00Z', // 3h après
    city: 'Lyon',
    country: 'France'
  }, adminToken)
  
  let statusEventId = ''
  
  if (test1_2.status === 201 && test1_2.data.event) {
    statusEventId = test1_2.data.event.id
    logger.info('✅ PASS - Événement créé avec dates valides')
    logger.info(`   Status initial: ${test1_2.data.event.status}`)
    
    if (test1_2.data.event.status === 'upcoming') {
      logger.info('   ✓ Status "upcoming" correct pour événement futur')
      passed++
    } else {
      logger.error(`   ✗ Status devrait être "upcoming", reçu "${test1_2.data.event.status}"`)
      failed++
    }
  } else {
    logger.error('❌ FAIL - Création devrait réussir')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 2 : STATUS ET INSCRIPTIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 2 : Status et inscriptions\n')
  
  // Créer événement "completed" en DB
  const { data: completedEvent } = await supabase
    .from('events')
    .insert({
      title: 'Événement terminé',
      event_date: '2020-01-01T18:00:00Z',
      event_end_date: '2020-01-01T21:00:00Z',
      city: 'Paris',
      country: 'France',
      status: 'completed',
      created_by_user_id: adminUserId,
      is_active: true
    })
    .select()
    .single()
  
  // Test 2.1 : Inscription à événement completed
  logger.info('Test 2.1 : Inscription à événement terminé (status completed)')
  const test2_1 = await testAPI(`/api/events/${completedEvent.id}/register`, 'POST', {}, adminToken)
  
  if ((test2_1.status === 400 || test2_1.status === 500) && test2_1.data.error.includes('terminé')) {
    logger.info('✅ PASS - Inscription refusée (événement terminé)')
    logger.info(`   Message: "${test2_1.data.error}"`)
    passed++
  } else {
    logger.error('❌ FAIL - Devrait refuser inscription')
    logger.error(`   Status: ${test2_1.status}`)
    logger.error(`   Error: ${JSON.stringify(test2_1.data)}`)
    failed++
  }
  logger.info('')
  
  // Créer événement "cancelled" en DB
  const { data: cancelledEvent } = await supabase
    .from('events')
    .insert({
      title: 'Événement annulé',
      event_date: '2026-06-01T18:00:00Z',
      event_end_date: '2026-06-01T21:00:00Z',
      city: 'Paris',
      country: 'France',
      status: 'cancelled',
      created_by_user_id: adminUserId,
      is_active: true
    })
    .select()
    .single()
  
  // Test 2.2 : Inscription à événement cancelled
  logger.info('Test 2.2 : Inscription à événement annulé (status cancelled)')
  const test2_2 = await testAPI(`/api/events/${cancelledEvent.id}/register`, 'POST', {}, adminToken)
  
  if ((test2_2.status === 400 || test2_2.status === 500) && test2_2.data.error.includes('annulé')) {
    logger.info('✅ PASS - Inscription refusée (événement annulé)')
    logger.info(`   Message: "${test2_2.data.error}"`)
    passed++
  } else {
    logger.error('❌ FAIL - Devrait refuser inscription')
    logger.error(`   Status: ${test2_2.status}`)
    logger.error(`   Error: ${JSON.stringify(test2_2.data)}`)
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 3 : FILTRES PAR STATUS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 3 : Filtres par status\n')
  
  // Test 3.1 : Filtrer événements upcoming
  logger.info('Test 3.1 : Filtrer événements upcoming')
  const test3_1 = await testAPI('/api/events?status=upcoming', 'GET')
  
  if (test3_1.status === 200) {
    const allUpcoming = test3_1.data.events.every((e: any) => e.status === 'upcoming')
    
    if (allUpcoming) {
      logger.info('✅ PASS - Tous événements sont upcoming')
      logger.info(`   Total: ${test3_1.data.total}`)
      passed++
    } else {
      logger.error('❌ FAIL - Certains événements ne sont pas upcoming')
      failed++
    }
  } else {
    logger.error('❌ FAIL - Requête devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 3.2 : Filtrer événements completed
  logger.info('Test 3.2 : Filtrer événements completed')
  const test3_2 = await testAPI('/api/events?status=completed&is_active=true', 'GET')
  
  if (test3_2.status === 200) {
    const allCompleted = test3_2.data.events.every((e: any) => e.status === 'completed')
    
    if (allCompleted) {
      logger.info('✅ PASS - Tous événements sont completed')
      logger.info(`   Total: ${test3_2.data.total}`)
      passed++
    } else {
      logger.error('❌ FAIL - Certains événements ne sont pas completed')
      failed++
    }
  } else {
    logger.error('❌ FAIL - Requête devrait réussir')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 4 : MODIFICATION STATUS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 4 : Modification status\n')
  
  // Test 4.1 : Admin change status en "cancelled"
  logger.info('Test 4.1 : Admin annule un événement')
  const test4_1 = await testAPI(`/api/events/${statusEventId}`, 'PATCH', {
    status: 'cancelled'
  }, adminToken)
  
  if (test4_1.status === 200 && test4_1.data.event.status === 'cancelled') {
    logger.info('✅ PASS - Status changé en cancelled')
    passed++
  } else {
    logger.error('❌ FAIL - Status devrait être cancelled')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RÉSUMÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  RÉSULTATS TESTS STATUS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  const total = passed + failed
  const percentage = Math.round((passed / total) * 100)
  
  logger.info(`Total tests    : ${total}`)
  logger.info(`Réussis        : ${passed} ✅`)
  logger.info(`Échoués        : ${failed} ❌`)
  logger.info(`Taux réussite  : ${percentage}%\n`)
  
  if (failed === 0) {
    logger.info('🎉 TESTS STATUS VALIDÉS!\n')
  }
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  RÉSUMÉ TOTAL MODULE EVENTS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  logger.info('Tests de base : 13')
  logger.info('Tests avancés : 16')
  logger.info(`Tests status  : ${total}`)
  logger.info(`\nTOTAL EVENTS  : ${13 + 16 + total} tests\n`)
}

runStatusTests()

