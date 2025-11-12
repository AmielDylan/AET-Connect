import { logger } from '../src/utils/logger'

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

async function testAdminEvents() {
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  TEST ADMIN EVENTS MANAGEMENT')
  logger.info('═══════════════════════════════════════════════════\n')
  
  // Login admin
  logger.info('🔐 Login admin...')
  const login = await testAPI('/api/auth/login', 'POST', {
    email: 'test.admin@aetconnect.com',
    password: 'TestPass123!'
  })
  
  if (!login.data.access_token) {
    logger.error('❌ Échec authentification admin')
    return
  }
  
  const token = login.data.access_token
  logger.info('✅ Admin connecté\n')
  
  // Test 1 : Liste TOUS les événements (incluant inactifs)
  logger.info('📋 Test 1 : Liste tous les événements')
  const test1 = await testAPI('/api/admin/events', 'GET', null, token)
  logger.info(`   Status: ${test1.status}`)
  logger.info(`   Total: ${test1.data.total} événements`)
  if (test1.data.events) {
    const actifs = test1.data.events.filter((e: any) => e.is_active).length
    const inactifs = test1.data.events.filter((e: any) => !e.is_active).length
    logger.info(`   Actifs: ${actifs}`)
    logger.info(`   Inactifs: ${inactifs}`)
  }
  logger.info('')
  
  // Test 2 : Filtrer par status
  logger.info('📋 Test 2 : Filtrer événements upcoming')
  const test2 = await testAPI('/api/admin/events?status=upcoming', 'GET', null, token)
  logger.info(`   Status: ${test2.status}`)
  logger.info(`   Total upcoming: ${test2.data.total}`)
  logger.info('')
  
  // Test 3 : Filtrer inactifs
  logger.info('📋 Test 3 : Filtrer événements inactifs')
  const test3 = await testAPI('/api/admin/events?is_active=false', 'GET', null, token)
  logger.info(`   Status: ${test3.status}`)
  logger.info(`   Total inactifs: ${test3.data.total}`)
  logger.info('')
  
  // Test 4 : Modifier un événement (changer status)
  let test4Status = false
  let test5Status = false
  
  if (test1.data.events && test1.data.events.length > 0) {
    const eventId = test1.data.events[0].id
    
    logger.info('📋 Test 4 : Modifier événement (status → cancelled)')
    logger.info(`   Event ID: ${eventId}`)
    const test4 = await testAPI(`/api/admin/events/${eventId}`, 'PATCH', {
      status: 'cancelled'
    }, token)
    logger.info(`   Status: ${test4.status}`)
    if (test4.data.event) {
      logger.info(`   Nouveau status: ${test4.data.event.status}`)
    }
    test4Status = test4.status === 200
    logger.info('')
    
    // Test 5 : Liste participants (admin)
    logger.info('📋 Test 5 : Liste participants avec détails admin')
    const test5 = await testAPI(`/api/admin/events/${eventId}/participants`, 'GET', null, token)
    logger.info(`   Status: ${test5.status}`)
    logger.info(`   Participants: ${test5.data.total}`)
    if (test5.data.participants && test5.data.participants.length > 0) {
      const p = test5.data.participants[0]
      logger.info(`   Premier participant: ${p.first_name} ${p.last_name}`)
      logger.info(`   Email: ${p.email}`)
      logger.info(`   Role: ${p.role}`)
      logger.info(`   Ambassadeur: ${p.is_ambassador ? 'Oui' : 'Non'}`)
    }
    test5Status = test5.status === 200
    logger.info('')
  } else {
    logger.warn('⚠️  Aucun événement trouvé pour les tests 4 et 5')
    logger.info('')
  }
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  RÉSULTATS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  const tests = [
    { name: 'Liste tous événements', status: test1.status === 200 },
    { name: 'Filtrer par status', status: test2.status === 200 },
    { name: 'Filtrer inactifs', status: test3.status === 200 },
    { name: 'Modifier événement', status: test4Status },
    { name: 'Liste participants admin', status: test5Status }
  ]
  
  const passed = tests.filter(t => t.status).length
  const total = tests.length
  
  tests.forEach(test => {
    logger.info(`${test.status ? '✅' : '❌'} ${test.name}`)
  })
  
  logger.info('')
  logger.info(`Total: ${passed}/${total} tests réussis`)
  logger.info('')
  
  if (passed === total) {
    logger.info('🎉 Tous les tests admin events passent!\n')
  }
}

testAdminEvents()

