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

async function runEventsTests() {
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  TESTS MODULE EVENTS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  let passed = 0
  let failed = 0
  
  let accessToken = ''
  let eventId = ''
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SETUP : Login
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('🔐 SETUP : Authentification\n')
  
  const login = await testAPI('/api/auth/login', 'POST', {
    email: 'test.admin@aetconnect.com',
    password: 'TestPass123!'
  })
  
  if (login.data.access_token) {
    accessToken = login.data.access_token
    logger.info('✅ Authentification réussie\n')
  } else {
    logger.error('❌ Authentification échouée')
    return
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 1 : CRÉATION ÉVÉNEMENT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 1 : Création événement\n')
  
  // Test 1.1 : Créer événement sans authentification
  logger.info('Test 1.1 : Créer événement sans token')
  const test1_1 = await testAPI('/api/events', 'POST', {
    title: 'Rencontre Alumni',
    event_date: '2026-06-15T18:00:00Z',
    event_end_date: '2026-06-15T21:00:00Z',
    city: 'Paris',
    country: 'France'
  })
  
  if (test1_1.status === 401) {
    logger.info('✅ PASS - Création refusée sans auth')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 401')
    failed++
  }
  logger.info('')
  
  // Test 1.2 : Créer événement avec authentification
  logger.info('Test 1.2 : Créer événement avec token')
  const test1_2 = await testAPI('/api/events', 'POST', {
    title: 'Networking AET Connect - Paris',
    description: 'Rencontre des anciens élèves basés à Paris',
    event_date: '2026-06-15T18:00:00Z',
    event_end_date: '2026-06-15T21:00:00Z',
    city: 'Paris',
    country: 'France',
    address: '10 Avenue des Champs-Élysées',
    max_participants: 50
  }, accessToken)
  
  if (test1_2.status === 201 && test1_2.data.event) {
    eventId = test1_2.data.event.id
    logger.info('✅ PASS - Événement créé')
    logger.info(`   ID: ${eventId}`)
    logger.info(`   Titre: ${test1_2.data.event.title}`)
    passed++
  } else {
    logger.error('❌ FAIL - Création devrait réussir')
    logger.error(`   Status: ${test1_2.status}`)
    logger.error(`   Error: ${JSON.stringify(test1_2.data)}`)
    failed++
  }
  logger.info('')
  
  // Test 1.3 : Créer événement avec date passée (devrait échouer)
  logger.info('Test 1.3 : Créer événement avec date passée')
  const test1_3 = await testAPI('/api/events', 'POST', {
    title: 'Événement passé',
    event_date: '2020-01-01T18:00:00Z',
    event_end_date: '2020-01-01T21:00:00Z',
    city: 'Paris',
    country: 'France'
  }, accessToken)
  
  if (test1_3.status === 400) {
    logger.info('✅ PASS - Date passée rejetée')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait rejeter date passée')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 2 : RÉCUPÉRATION ÉVÉNEMENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 2 : Récupération événements\n')
  
  // Test 2.1 : Liste tous les événements (public)
  logger.info('Test 2.1 : Liste événements (public)')
  const test2_1 = await testAPI('/api/events', 'GET')
  
  if (test2_1.status === 200 && Array.isArray(test2_1.data.events)) {
    logger.info('✅ PASS - Liste récupérée')
    logger.info(`   Total: ${test2_1.data.total} événement(s)`)
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner liste')
    failed++
  }
  logger.info('')
  
  // Test 2.2 : Détails d'un événement (public)
  logger.info('Test 2.2 : Détails événement (public)')
  const test2_2 = await testAPI(`/api/events/${eventId}`, 'GET')
  
  if (test2_2.status === 200 && test2_2.data.id) {
    logger.info('✅ PASS - Détails récupérés')
    logger.info(`   Participants: ${test2_2.data.participant_count}`)
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner détails')
    failed++
  }
  logger.info('')
  
  // Test 2.3 : Filtrer événements par pays
  logger.info('Test 2.3 : Filtrer par pays (France)')
  const test2_3 = await testAPI('/api/events?country=France', 'GET')
  
  if (test2_3.status === 200) {
    logger.info('✅ PASS - Filtre pays fonctionne')
    passed++
  } else {
    logger.error('❌ FAIL - Filtre devrait fonctionner')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 3 : INSCRIPTION/DÉSINSCRIPTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 3 : Inscription/Désinscription\n')
  
  // Test 3.1 : S'inscrire sans authentification
  logger.info('Test 3.1 : S\'inscrire sans token')
  const test3_1 = await testAPI(`/api/events/${eventId}/register`, 'POST')
  
  if (test3_1.status === 401) {
    logger.info('✅ PASS - Inscription refusée sans auth')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 401')
    failed++
  }
  logger.info('')
  
  // Test 3.2 : S'inscrire avec authentification
  logger.info('Test 3.2 : S\'inscrire avec token')
  const test3_2 = await testAPI(`/api/events/${eventId}/register`, 'POST', {}, accessToken)
  
  if (test3_2.status === 200 && test3_2.data.success) {
    logger.info('✅ PASS - Inscription réussie')
    passed++
  } else {
    logger.error('❌ FAIL - Inscription devrait réussir')
    logger.error(`   Status: ${test3_2.status}`)
    logger.error(`   Error: ${JSON.stringify(test3_2.data)}`)
    failed++
  }
  logger.info('')
  
  // Test 3.3 : S'inscrire 2 fois (devrait échouer)
  logger.info('Test 3.3 : S\'inscrire 2 fois au même événement')
  const test3_3 = await testAPI(`/api/events/${eventId}/register`, 'POST', {}, accessToken)
  
  if (test3_3.status === 400 && test3_3.data.error.includes('déjà inscrit')) {
    logger.info('✅ PASS - Double inscription rejetée')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait rejeter double inscription')
    failed++
  }
  logger.info('')
  
  // Test 3.4 : Se désinscrire
  logger.info('Test 3.4 : Se désinscrire')
  const test3_4 = await testAPI(`/api/events/${eventId}/unregister`, 'DELETE', null, accessToken)
  
  if (test3_4.status === 200 && test3_4.data.success) {
    logger.info('✅ PASS - Désinscription réussie')
    passed++
  } else {
    logger.error('❌ FAIL - Désinscription devrait réussir')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 4 : MODIFICATION/SUPPRESSION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 4 : Modification/Suppression\n')
  
  // Test 4.1 : Modifier événement
  logger.info('Test 4.1 : Modifier événement')
  const test4_1 = await testAPI(`/api/events/${eventId}`, 'PATCH', {
    title: 'Networking AET Connect - Paris (Modifié)',
    max_participants: 60
  }, accessToken)
  
  if (test4_1.status === 200 && test4_1.data.event) {
    logger.info('✅ PASS - Modification réussie')
    logger.info(`   Nouveau titre: ${test4_1.data.event.title}`)
    passed++
  } else {
    logger.error('❌ FAIL - Modification devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 4.2 : Supprimer événement
  logger.info('Test 4.2 : Supprimer événement')
  const test4_2 = await testAPI(`/api/events/${eventId}`, 'DELETE', null, accessToken)
  
  if (test4_2.status === 200 && test4_2.data.success) {
    logger.info('✅ PASS - Suppression réussie')
    passed++
  } else {
    logger.error('❌ FAIL - Suppression devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 4.3 : Vérifier que l'événement est inactif
  logger.info('Test 4.3 : Vérifier événement inactif')
  const test4_3 = await testAPI(`/api/events/${eventId}`, 'GET')
  
  if (test4_3.status === 200 && test4_3.data.is_active === false) {
    logger.info('✅ PASS - Événement bien inactif')
    passed++
  } else {
    logger.error('❌ FAIL - Événement devrait être inactif')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RÉSUMÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  RÉSULTATS TESTS EVENTS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  const total = passed + failed
  const percentage = Math.round((passed / total) * 100)
  
  logger.info(`Total tests    : ${total}`)
  logger.info(`Réussis        : ${passed} ✅`)
  logger.info(`Échoués        : ${failed} ❌`)
  logger.info(`Taux réussite  : ${percentage}%\n`)
  
  if (failed === 0) {
    logger.info('🎉 MODULE EVENTS VALIDÉ!\n')
    logger.info('✓ Création événements fonctionnelle')
    logger.info('✓ Récupération et filtres OK')
    logger.info('✓ Inscriptions/désinscriptions fonctionnelles')
    logger.info('✓ Modification/suppression OK\n')
  }
}

runEventsTests()

