import { supabase } from '../../../src/config/database'
import { logger } from '../../../src/utils/logger'
import bcrypt from 'bcrypt'

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

async function runAdvancedEventsTests() {
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  TESTS AVANCÉS - MODULE EVENTS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  let passed = 0
  let failed = 0
  
  let adminToken = ''
  let memberToken = ''
  let eventId = ''
  let eventWithLimitId = ''
  let tempUser: any = null
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SETUP : Login admin et membre
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('🔐 SETUP : Authentification\n')
  
  const adminLogin = await testAPI('/api/auth/login', 'POST', {
    email: 'test.admin@aetconnect.com',
    password: 'TestPass123!'
  })
  
  const memberLogin = await testAPI('/api/auth/login', 'POST', {
    email: 'test.membre@aetconnect.com',
    password: 'TestPass123!'
  })
  
  if (adminLogin.data.access_token && memberLogin.data.access_token) {
    adminToken = adminLogin.data.access_token
    memberToken = memberLogin.data.access_token
    logger.info('✅ Admin et Membre authentifiés\n')
  } else {
    logger.error('❌ Authentification échouée')
    return
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 1 : LIMITE PARTICIPANTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 1 : Limite participants\n')
  
  // Test 1.1 : Créer événement avec max_participants = 2
  logger.info('Test 1.1 : Créer événement avec max_participants = 2')
  const test1_1 = await testAPI('/api/events', 'POST', {
    title: 'Événement Limité - Test',
    event_date: '2026-08-01T18:00:00Z',
    event_end_date: '2026-08-01T21:00:00Z',
    city: 'Paris',
    country: 'France',
    max_participants: 2
  }, adminToken)
  
  if (test1_1.status === 201 && test1_1.data.event) {
    eventWithLimitId = test1_1.data.event.id
    logger.info('✅ PASS - Événement créé avec limite 2')
    logger.info(`   ID: ${eventWithLimitId}`)
    passed++
  } else {
    logger.error('❌ FAIL - Création devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 1.2 : Première inscription (admin)
  logger.info('Test 1.2 : Première inscription')
  const test1_2 = await testAPI(`/api/events/${eventWithLimitId}/register`, 'POST', {}, adminToken)
  
  if (test1_2.status === 200) {
    logger.info('✅ PASS - Inscription 1/2 réussie')
    passed++
  } else {
    logger.error('❌ FAIL - Inscription devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 1.3 : Deuxième inscription (membre)
  logger.info('Test 1.3 : Deuxième inscription')
  const test1_3 = await testAPI(`/api/events/${eventWithLimitId}/register`, 'POST', {}, memberToken)
  
  if (test1_3.status === 200) {
    logger.info('✅ PASS - Inscription 2/2 réussie')
    passed++
  } else {
    logger.error('❌ FAIL - Inscription devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 1.4 : Troisième inscription (devrait échouer - complet)
  logger.info('Test 1.4 : Troisième inscription (événement complet)')
  
  // Créer un 3ème utilisateur temporaire pour tester
  const passwordHash = await bcrypt.hash('TempPass123!', 10)
  const { data: tempUserData } = await supabase
    .from('users')
    .insert({
      email: `temp.test.${Date.now()}@example.com`,
      password_hash: passwordHash,
      first_name: 'Temp',
      last_name: 'User',
      school_id: '7f081ca5-2e61-44dd-be1a-2cf43137f67f',
      entry_year: '2020',
      role: 'alumni',
      is_active: true
    })
    .select()
    .single()
  
  if (tempUserData) {
    tempUser = tempUserData
    
    const tempLogin = await testAPI('/api/auth/login', 'POST', {
      email: tempUser.email,
      password: 'TempPass123!'
    })
    
    const tempToken = tempLogin.data.access_token
    
    const test1_4 = await testAPI(`/api/events/${eventWithLimitId}/register`, 'POST', {}, tempToken)
    
    if (test1_4.status === 400 && test1_4.data.error.includes('complet')) {
      logger.info('✅ PASS - Inscription refusée (événement complet)')
      logger.info(`   Message: "${test1_4.data.error}"`)
      passed++
    } else {
      logger.error('❌ FAIL - Devrait rejeter (événement complet)')
      failed++
    }
  } else {
    logger.error('❌ FAIL - Impossible de créer utilisateur temporaire')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 2 : LISTE PARTICIPANTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 2 : Liste participants\n')
  
  // Test 2.1 : Récupérer liste participants
  logger.info('Test 2.1 : Récupérer liste participants')
  const test2_1 = await testAPI(`/api/events/${eventWithLimitId}/participants`, 'GET')
  
  if (test2_1.status === 200 && Array.isArray(test2_1.data.participants)) {
    logger.info('✅ PASS - Liste récupérée')
    logger.info(`   Participants: ${test2_1.data.total}`)
    test2_1.data.participants.forEach((p: any) => {
      logger.info(`   - ${p.first_name} ${p.last_name}`)
    })
    passed++
  } else {
    logger.error('❌ FAIL - Liste devrait être retournée')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 3 : DÉSINSCRIPTION ET RÉINSCRIPTION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 3 : Désinscription et réinscription\n')
  
  // Test 3.1 : Désinscription membre
  logger.info('Test 3.1 : Désinscription membre')
  const test3_1 = await testAPI(`/api/events/${eventWithLimitId}/unregister`, 'DELETE', null, memberToken)
  
  if (test3_1.status === 200 && test3_1.data.success) {
    logger.info('✅ PASS - Désinscription réussie')
    passed++
  } else {
    logger.error('❌ FAIL - Désinscription devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 3.2 : Vérifier participant_count après désinscription
  logger.info('Test 3.2 : Vérifier compteur participants')
  const test3_2 = await testAPI(`/api/events/${eventWithLimitId}`, 'GET')
  
  if (test3_2.status === 200 && test3_2.data.participant_count === 1) {
    logger.info('✅ PASS - Compteur mis à jour (1/2)')
    passed++
  } else {
    logger.error(`❌ FAIL - Compteur devrait être 1, reçu ${test3_2.data.participant_count}`)
    failed++
  }
  logger.info('')
  
  // Test 3.3 : Réinscription du membre (devrait fonctionner, place disponible)
  logger.info('Test 3.3 : Réinscription du membre')
  const test3_3 = await testAPI(`/api/events/${eventWithLimitId}/register`, 'POST', {}, memberToken)
  
  if (test3_3.status === 200 && test3_3.data.success) {
    logger.info('✅ PASS - Réinscription réussie')
    passed++
  } else {
    logger.error('❌ FAIL - Réinscription devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 3.4 : Vérifier que limite est à nouveau atteinte
  logger.info('Test 3.4 : Vérifier limite à nouveau atteinte')
  // Attendre un peu pour que la DB se synchronise
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Vérifier via l'endpoint event details (plus fiable)
  const test3_4 = await testAPI(`/api/events/${eventWithLimitId}`, 'GET')
  
  if (test3_4.status === 200 && test3_4.data.participant_count === 2) {
    logger.info('✅ PASS - 2 participants confirmés')
    logger.info(`   Compteur: ${test3_4.data.participant_count}`)
    passed++
  } else {
    logger.error(`❌ FAIL - Devrait avoir 2 participants`)
    logger.error(`   Compteur: ${test3_4.data.participant_count}`)
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 4 : PERMISSIONS MODIFICATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 4 : Permissions modification\n')
  
  // Test 4.1 : Membre tente de modifier événement d'admin
  logger.info('Test 4.1 : Membre tente de modifier événement créé par admin')
  const test4_1 = await testAPI(`/api/events/${eventWithLimitId}`, 'PATCH', {
    title: 'Tentative modification membre'
  }, memberToken)
  
  if (test4_1.status === 403 && test4_1.data.error.includes('permission')) {
    logger.info('✅ PASS - Modification refusée')
    logger.info(`   Message: "${test4_1.data.error}"`)
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 403')
    failed++
  }
  logger.info('')
  
  // Test 4.2 : Admin modifie son propre événement
  logger.info('Test 4.2 : Admin modifie son propre événement')
  const test4_2 = await testAPI(`/api/events/${eventWithLimitId}`, 'PATCH', {
    title: 'Événement Limité - Modifié',
    max_participants: 3
  }, adminToken)
  
  if (test4_2.status === 200 && test4_2.data.event) {
    logger.info('✅ PASS - Modification réussie')
    logger.info(`   Nouveau titre: ${test4_2.data.event.title}`)
    passed++
  } else {
    logger.error('❌ FAIL - Modification devrait réussir')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 5 : PERMISSIONS SUPPRESSION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 5 : Permissions suppression\n')
  
  // Créer un événement par le membre
  const memberEvent = await testAPI('/api/events', 'POST', {
    title: 'Événement créé par membre',
    event_date: '2026-09-01T18:00:00Z',
    event_end_date: '2026-09-01T21:00:00Z',
    city: 'Lyon',
    country: 'France'
  }, memberToken)
  
  const memberEventId = memberEvent.data.event?.id
  
  if (!memberEventId) {
    logger.error('❌ Impossible de créer événement membre')
    failed++
  } else {
    // Test 5.1 : Admin tente de supprimer événement du membre
    logger.info('Test 5.1 : Admin supprime événement créé par membre')
    const test5_1 = await testAPI(`/api/events/${memberEventId}`, 'DELETE', null, adminToken)
    
    if (test5_1.status === 200 && test5_1.data.success) {
      logger.info('✅ PASS - Admin peut supprimer (privilège)')
      passed++
    } else {
      logger.error('❌ FAIL - Admin devrait pouvoir supprimer')
      failed++
    }
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 6 : ÉVÉNEMENT PASSÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 6 : Événement passé\n')
  
  // Créer événement passé directement en DB (contourner validation API)
  const { data: pastEvent } = await supabase
    .from('events')
    .insert({
      title: 'Événement passé',
      event_date: '2020-01-01T18:00:00Z',
      event_end_date: '2020-01-01T21:00:00Z',
      city: 'Paris',
      country: 'France',
      status: 'completed',
      created_by_user_id: tempUser?.id || adminLogin.data.user.id,
      is_active: true
    })
    .select()
    .single()
  
  if (pastEvent) {
    // Test 6.1 : Tenter inscription à événement passé
    logger.info('Test 6.1 : Inscription à événement passé')
    const test6_1 = await testAPI(`/api/events/${pastEvent.id}/register`, 'POST', {}, memberToken)
    
    if ((test6_1.status === 400 || test6_1.status === 500) && 
        (test6_1.data.error.includes('terminé') || test6_1.data.error.includes('passé'))) {
      logger.info('✅ PASS - Inscription refusée (événement passé)')
      logger.info(`   Message: "${test6_1.data.error}"`)
      passed++
    } else {
      logger.error('❌ FAIL - Devrait rejeter événement passé')
      logger.error(`   Status: ${test6_1.status}`)
      logger.error(`   Error: ${JSON.stringify(test6_1.data)}`)
      failed++
    }
  } else {
    logger.error('❌ FAIL - Impossible de créer événement passé')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 7 : FILTRES AVANCÉS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 7 : Filtres avancés\n')
  
  // Test 7.1 : Filtre date_from
  logger.info('Test 7.1 : Filtre date_from (après 2026-01-01)')
  const test7_1 = await testAPI('/api/events?date_from=2026-01-01', 'GET')
  
  if (test7_1.status === 200) {
    const eventsAfter2026 = test7_1.data.events.every((e: any) => 
      new Date(e.event_date) >= new Date('2026-01-01')
    )
    
    if (eventsAfter2026) {
      logger.info('✅ PASS - Tous événements après 2026-01-01')
      passed++
    } else {
      logger.error('❌ FAIL - Certains événements avant 2026-01-01')
      failed++
    }
  } else {
    logger.error('❌ FAIL - Requête devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 7.2 : Filtre created_by
  logger.info('Test 7.2 : Filtre created_by (admin)')
  const adminId = adminLogin.data.user.id
  const test7_2 = await testAPI(`/api/events?created_by=${adminId}`, 'GET')
  
  if (test7_2.status === 200) {
    const allByAdmin = test7_2.data.events.every((e: any) => 
      e.created_by_user_id === adminId
    )
    
    if (allByAdmin) {
      logger.info('✅ PASS - Tous événements créés par admin')
      logger.info(`   Total: ${test7_2.data.total}`)
      passed++
    } else {
      logger.error('❌ FAIL - Certains événements par autre créateur')
      failed++
    }
  } else {
    logger.error('❌ FAIL - Requête devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 7.3 : Pagination
  logger.info('Test 7.3 : Pagination (limit=2, offset=0)')
  const test7_3 = await testAPI('/api/events?limit=2&offset=0', 'GET')
  
  if (test7_3.status === 200 && test7_3.data.events.length <= 2) {
    logger.info('✅ PASS - Pagination respectée')
    logger.info(`   Résultats: ${test7_3.data.events.length}`)
    passed++
  } else {
    logger.error('❌ FAIL - Pagination non respectée')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CLEANUP : Supprimer utilisateur temporaire
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  if (tempUser) {
    await supabase
      .from('users')
      .delete()
      .eq('id', tempUser.id)
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RÉSUMÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  RÉSULTATS TESTS AVANCÉS EVENTS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  const total = passed + failed
  const percentage = Math.round((passed / total) * 100)
  
  logger.info(`Total tests    : ${total}`)
  logger.info(`Réussis        : ${passed} ✅`)
  logger.info(`Échoués        : ${failed} ❌`)
  logger.info(`Taux réussite  : ${percentage}%\n`)
  
  if (failed === 0) {
    logger.info('🎉 TESTS AVANCÉS EVENTS VALIDÉS!\n')
    logger.info('✓ Limite participants respectée')
    logger.info('✓ Liste participants fonctionnelle')
    logger.info('✓ Désinscription/Réinscription OK')
    logger.info('✓ Permissions modification/suppression OK')
    logger.info('✓ Événement passé géré')
    logger.info('✓ Filtres avancés fonctionnels\n')
  }
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  RÉSUMÉ COMPLET MODULE EVENTS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  logger.info('Tests de base (events-complete.test.ts) : 13')
  logger.info(`Tests avancés (events-advanced.test.ts) : ${total}`)
  logger.info(`TOTAL EVENTS : ${13 + total} tests\n`)
}

runAdvancedEventsTests()

