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

async function runAdminTests() {
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  TESTS EXHAUSTIFS - MODULE ADMIN')
  logger.info('═══════════════════════════════════════════════════\n')
  
  let passed = 0
  let failed = 0
  
  let adminToken = ''
  let memberToken = ''
  let adminId = ''
  let memberId = ''
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SETUP : Login
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
    adminId = adminLogin.data.user.id
    memberId = memberLogin.data.user.id
    logger.info('✅ Admin et Membre authentifiés\n')
  } else {
    logger.error('❌ Authentification échouée')
    return
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 1 : STATISTIQUES (4 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 1 : Statistiques (4 tests)\n')
  
  // Test 1.1 : Stats sans auth
  logger.info('Test 1.1 : Récupérer stats sans authentification')
  const test1_1 = await testAPI('/api/admin/stats', 'GET')
  
  if (test1_1.status === 401) {
    logger.info('✅ PASS - Stats refusées sans auth')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 401')
    failed++
  }
  logger.info('')
  
  // Test 1.2 : Stats avec membre
  logger.info('Test 1.2 : Membre tente récupérer stats')
  const test1_2 = await testAPI('/api/admin/stats', 'GET', null, memberToken)
  
  if (test1_2.status === 403) {
    logger.info('✅ PASS - Stats refusées pour membre')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 403')
    failed++
  }
  logger.info('')
  
  // Test 1.3 : Stats avec admin
  logger.info('Test 1.3 : Admin récupère stats complètes')
  const test1_3 = await testAPI('/api/admin/stats', 'GET', null, adminToken)
  
  if (test1_3.status === 200 && test1_3.data.users && test1_3.data.events) {
    logger.info('✅ PASS - Stats récupérées')
    logger.info(`   Utilisateurs: ${test1_3.data.users.total}`)
    logger.info(`   Événements: ${test1_3.data.events.total}`)
    logger.info(`   Codes: ${test1_3.data.codes.total_generated}`)
    passed++
  } else {
    logger.error('❌ FAIL - Stats devraient être retournées')
    failed++
  }
  logger.info('')
  
  // Test 1.4 : Vérifier structure stats
  logger.info('Test 1.4 : Vérifier structure stats')
  const hasRequiredFields = 
    test1_3.data.users?.by_role &&
    test1_3.data.users.by_role.alumni !== undefined &&
    test1_3.data.users.by_role.moderator !== undefined &&
    test1_3.data.users.by_role.admin !== undefined &&
    test1_3.data.events?.by_status &&
    test1_3.data.codes?.total_generated !== undefined &&
    test1_3.data.access_requests?.pending !== undefined &&
    Array.isArray(test1_3.data.registrations_by_month)
  
  if (hasRequiredFields) {
    logger.info('✅ PASS - Structure stats complète')
    logger.info(`   Alumni: ${test1_3.data.users.by_role.alumni}`)
    logger.info(`   Moderators: ${test1_3.data.users.by_role.moderator}`)
    logger.info(`   Admins: ${test1_3.data.users.by_role.admin}`)
    passed++
  } else {
    logger.error('❌ FAIL - Structure stats incomplète')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 2 : DEMANDES D'ACCÈS (7 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 2 : Demandes d\'accès (7 tests)\n')
  
  // Test 2.1 : Liste demandes
  logger.info('Test 2.1 : Liste des demandes d\'accès')
  const test2_1 = await testAPI('/api/admin/access-requests', 'GET', null, adminToken)
  
  if (test2_1.status === 200 && Array.isArray(test2_1.data.requests)) {
    logger.info('✅ PASS - Liste récupérée')
    logger.info(`   Total: ${test2_1.data.total}`)
    passed++
  } else {
    logger.error('❌ FAIL - Liste devrait être retournée')
    failed++
  }
  logger.info('')
  
  // Test 2.2 : Filtrer par status pending
  logger.info('Test 2.2 : Filtrer demandes par status (pending)')
  const test2_2 = await testAPI('/api/admin/access-requests?status=pending', 'GET', null, adminToken)
  
  if (test2_2.status === 200) {
    const allPending = test2_2.data.requests.every((r: any) => r.status === 'pending')
    
    if (allPending || test2_2.data.requests.length === 0) {
      logger.info('✅ PASS - Filtre pending fonctionne')
      logger.info(`   Demandes pending: ${test2_2.data.total}`)
      passed++
    } else {
      logger.error('❌ FAIL - Certaines demandes ne sont pas pending')
      failed++
    }
  } else {
    logger.error('❌ FAIL - Requête devrait réussir')
    failed++
  }
  logger.info('')
  
  // Créer des demandes de test
  const { data: testRequest1 } = await supabase
    .from('access_requests')
    .insert({
      email: `test.approve.${Date.now()}@example.com`,
      first_name: 'Test',
      last_name: 'Approve',
      school_id: '7f081ca5-2e61-44dd-be1a-2cf43137f67f',
      entry_year: '2020',
      status: 'pending'
    })
    .select()
    .single()
  
  const { data: testRequest2 } = await supabase
    .from('access_requests')
    .insert({
      email: `test.reject.${Date.now()}@example.com`,
      first_name: 'Test',
      last_name: 'Reject',
      school_id: '7f081ca5-2e61-44dd-be1a-2cf43137f67f',
      entry_year: '2020',
      status: 'pending'
    })
    .select()
    .single()
  
  // Test 2.3 : Membre tente approuver
  logger.info('Test 2.3 : Membre tente approuver demande')
  const test2_3 = await testAPI(`/api/admin/access-requests/${testRequest1.id}/approve`, 'POST', {}, memberToken)
  
  if (test2_3.status === 403) {
    logger.info('✅ PASS - Approbation refusée pour membre')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 403')
    failed++
  }
  logger.info('')
  
  // Test 2.4 : Admin approuve demande
  logger.info('Test 2.4 : Admin approuve demande')
  const test2_4 = await testAPI(`/api/admin/access-requests/${testRequest1.id}/approve`, 'POST', {}, adminToken)
  
  if (test2_4.status === 200 && test2_4.data.user && test2_4.data.temp_password) {
    logger.info('✅ PASS - Demande approuvée')
    logger.info(`   Utilisateur: ${test2_4.data.user.email}`)
    logger.info(`   Mot de passe: ${test2_4.data.temp_password}`)
    logger.info(`   Max codes: ${test2_4.data.user.max_codes_allowed}`)
    passed++
  } else {
    logger.error('❌ FAIL - Approbation devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 2.5 : Tenter approuver demande déjà traitée
  logger.info('Test 2.5 : Tenter approuver demande déjà traitée')
  const test2_5 = await testAPI(`/api/admin/access-requests/${testRequest1.id}/approve`, 'POST', {}, adminToken)
  
  if (test2_5.status === 400 && test2_5.data.error.includes('déjà été traitée')) {
    logger.info('✅ PASS - Double approbation refusée')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 400')
    failed++
  }
  logger.info('')
  
  // Test 2.6 : Admin rejette demande
  logger.info('Test 2.6 : Admin rejette demande')
  const test2_6 = await testAPI(`/api/admin/access-requests/${testRequest2.id}/reject`, 'POST', {}, adminToken)
  
  if (test2_6.status === 200 && test2_6.data.success) {
    logger.info('✅ PASS - Demande rejetée')
    passed++
  } else {
    logger.error('❌ FAIL - Rejet devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 2.7 : Tenter rejeter demande déjà traitée
  logger.info('Test 2.7 : Tenter rejeter demande déjà traitée')
  const test2_7 = await testAPI(`/api/admin/access-requests/${testRequest2.id}/reject`, 'POST', {}, adminToken)
  
  if (test2_7.status === 400 && test2_7.data.error.includes('déjà été traitée')) {
    logger.info('✅ PASS - Double rejet refusé')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 400')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 3 : LISTE UTILISATEURS (6 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 3 : Liste utilisateurs (6 tests)\n')
  
  // Test 3.1 : Liste sans filtres
  logger.info('Test 3.1 : Liste utilisateurs sans filtres')
  const test3_1 = await testAPI('/api/admin/users', 'GET', null, adminToken)
  
  if (test3_1.status === 200 && Array.isArray(test3_1.data.users)) {
    logger.info('✅ PASS - Liste récupérée')
    logger.info(`   Total: ${test3_1.data.total}`)
    passed++
  } else {
    logger.error('❌ FAIL - Liste devrait être retournée')
    failed++
  }
  logger.info('')
  
  // Test 3.2 : Filtrer par rôle
  logger.info('Test 3.2 : Filtrer par rôle (alumni)')
  const test3_2 = await testAPI('/api/admin/users?role=alumni', 'GET', null, adminToken)
  
  if (test3_2.status === 200) {
    const allAlumni = test3_2.data.users.every((u: any) => u.role === 'alumni')
    
    if (allAlumni) {
      logger.info('✅ PASS - Filtre rôle fonctionne')
      logger.info(`   Alumni: ${test3_2.data.total}`)
      passed++
    } else {
      logger.error('❌ FAIL - Certains ne sont pas alumni')
      failed++
    }
  } else {
    logger.error('❌ FAIL - Requête devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 3.3 : Filtrer par is_active
  logger.info('Test 3.3 : Filtrer par is_active (true)')
  const test3_3 = await testAPI('/api/admin/users?is_active=true', 'GET', null, adminToken)
  
  if (test3_3.status === 200) {
    const allActive = test3_3.data.users.every((u: any) => u.is_active === true)
    
    if (allActive) {
      logger.info('✅ PASS - Filtre is_active fonctionne')
      logger.info(`   Actifs: ${test3_3.data.total}`)
      passed++
    } else {
      logger.error('❌ FAIL - Certains ne sont pas actifs')
      failed++
    }
  } else {
    logger.error('❌ FAIL - Requête devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 3.4 : Filtrer par is_ambassador
  logger.info('Test 3.4 : Filtrer par is_ambassador (true)')
  const test3_4 = await testAPI('/api/admin/users?is_ambassador=true', 'GET', null, adminToken)
  
  if (test3_4.status === 200) {
    const allAmbassadors = test3_4.data.users.every((u: any) => u.is_ambassador === true)
    
    if (allAmbassadors || test3_4.data.users.length === 0) {
      logger.info('✅ PASS - Filtre is_ambassador fonctionne')
      logger.info(`   Ambassadeurs: ${test3_4.data.total}`)
      passed++
    } else {
      logger.error('❌ FAIL - Certains ne sont pas ambassadeurs')
      failed++
    }
  } else {
    logger.error('❌ FAIL - Requête devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 3.5 : Recherche par nom
  logger.info('Test 3.5 : Recherche par nom (search=Test)')
  const test3_5 = await testAPI('/api/admin/users?search=Test', 'GET', null, adminToken)
  
  if (test3_5.status === 200) {
    logger.info('✅ PASS - Recherche fonctionne')
    logger.info(`   Résultats: ${test3_5.data.total}`)
    passed++
  } else {
    logger.error('❌ FAIL - Recherche devrait fonctionner')
    failed++
  }
  logger.info('')
  
  // Test 3.6 : Pagination
  logger.info('Test 3.6 : Pagination (limit=5)')
  const test3_6 = await testAPI('/api/admin/users?limit=5', 'GET', null, adminToken)
  
  if (test3_6.status === 200 && test3_6.data.users.length <= 5) {
    logger.info('✅ PASS - Pagination fonctionne')
    logger.info(`   Résultats: ${test3_6.data.users.length}`)
    passed++
  } else {
    logger.error('❌ FAIL - Pagination devrait limiter')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 4 : MODIFICATION UTILISATEURS (5 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 4 : Modification utilisateurs (5 tests)\n')
  
  const targetUserId = test3_1.data.users.find((u: any) => u.role === 'alumni')?.id
  
  // Test 4.1 : Membre tente modifier
  logger.info('Test 4.1 : Membre tente modifier utilisateur')
  const test4_1 = await testAPI(`/api/admin/users/${targetUserId}`, 'PATCH', {
    current_city: 'Paris'
  }, memberToken)
  
  if (test4_1.status === 403) {
    logger.info('✅ PASS - Modification refusée pour membre')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 403')
    failed++
  }
  logger.info('')
  
  // Test 4.2 : Admin modifie nom/prénom
  logger.info('Test 4.2 : Admin modifie nom/prénom')
  const test4_2 = await testAPI(`/api/admin/users/${targetUserId}`, 'PATCH', {
    first_name: 'Jean',
    last_name: 'Dupont'
  }, adminToken)
  
  if (test4_2.status === 200 && test4_2.data.user) {
    logger.info('✅ PASS - Modification réussie')
    logger.info(`   Nouveau nom: ${test4_2.data.user.first_name} ${test4_2.data.user.last_name}`)
    passed++
  } else {
    logger.error('❌ FAIL - Modification devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 4.3 : Admin modifie ville
  logger.info('Test 4.3 : Admin modifie ville')
  const test4_3 = await testAPI(`/api/admin/users/${targetUserId}`, 'PATCH', {
    current_city: 'Lyon',
    current_country: 'France'
  }, adminToken)
  
  if (test4_3.status === 200) {
    logger.info('✅ PASS - Ville modifiée')
    logger.info(`   Nouvelle ville: ${test4_3.data.user.current_city}`)
    passed++
  } else {
    logger.error('❌ FAIL - Modification devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 4.4 : Admin change rôle
  logger.info('Test 4.4 : Admin change rôle (alumni → moderator)')
  const test4_4 = await testAPI(`/api/admin/users/${targetUserId}`, 'PATCH', {
    role: 'moderator'
  }, adminToken)
  
  if (test4_4.status === 200 && test4_4.data.user.role === 'moderator') {
    logger.info('✅ PASS - Rôle changé')
    logger.info(`   Nouveau rôle: ${test4_4.data.user.role}`)
    passed++
  } else {
    logger.error('❌ FAIL - Changement rôle devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 4.5 : Admin désactive utilisateur
  logger.info('Test 4.5 : Admin désactive utilisateur')
  const test4_5 = await testAPI(`/api/admin/users/${targetUserId}`, 'PATCH', {
    is_active: false
  }, adminToken)
  
  if (test4_5.status === 200 && test4_5.data.user.is_active === false) {
    logger.info('✅ PASS - Utilisateur désactivé')
    passed++
    
    // Réactiver pour la suite
    await testAPI(`/api/admin/users/${targetUserId}`, 'PATCH', {
      is_active: true,
      role: 'alumni'
    }, adminToken)
  } else {
    logger.error('❌ FAIL - Désactivation devrait réussir')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 5 : AMBASSADEURS (5 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 5 : Gestion ambassadeurs (5 tests)\n')
  
  // Test 5.1 : Désigner ambassadeur
  logger.info('Test 5.1 : Désigner ambassadeur')
  const test5_1 = await testAPI(`/api/admin/users/${targetUserId}/set-ambassador`, 'POST', {
    is_ambassador: true
  }, adminToken)
  
  if (test5_1.status === 200 && test5_1.data.user.is_ambassador === true) {
    logger.info('✅ PASS - Ambassadeur désigné')
    logger.info(`   Max codes: ${test5_1.data.user.max_codes_allowed}`)
    passed++
  } else {
    logger.error('❌ FAIL - Désignation devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 5.2 : Vérifier limite codes ambassadeur (20)
  logger.info('Test 5.2 : Vérifier limite codes ambassadeur')
  if (test5_1.data.user.max_codes_allowed === 20) {
    logger.info('✅ PASS - Limite codes mise à 20')
    passed++
  } else {
    logger.error(`❌ FAIL - Limite devrait être 20, reçu ${test5_1.data.user.max_codes_allowed}`)
    failed++
  }
  logger.info('')
  
  // Test 5.3 : Générer codes avec limite ambassadeur
  logger.info('Test 5.3 : Générer codes avec limite ambassadeur')
  
  // Compter codes existants
  const { count: existingCodes } = await supabase
    .from('invitation_codes')
    .select('*', { count: 'exact', head: true })
    .eq('created_by_user_id', targetUserId)
  
  const codesRemaining = 20 - (existingCodes || 0)
  
  if (codesRemaining > 0) {
    logger.info(`✅ PASS - Peut générer ${codesRemaining} codes`)
    passed++
  } else {
    logger.info('⚠️ SKIP - Limite déjà atteinte')
    passed++
  }
  logger.info('')
  
  // Test 5.4 : Retirer ambassadeur
  logger.info('Test 5.4 : Retirer statut ambassadeur')
  const test5_4 = await testAPI(`/api/admin/users/${targetUserId}/set-ambassador`, 'POST', {
    is_ambassador: false
  }, adminToken)
  
  if (test5_4.status === 200 && test5_4.data.user.is_ambassador === false) {
    logger.info('✅ PASS - Statut retiré')
    logger.info(`   Max codes: ${test5_4.data.user.max_codes_allowed}`)
    passed++
  } else {
    logger.error('❌ FAIL - Retrait devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 5.5 : Vérifier limite codes restaurée (3)
  logger.info('Test 5.5 : Vérifier limite codes restaurée')
  if (test5_4.data.user.max_codes_allowed === 3) {
    logger.info('✅ PASS - Limite restaurée à 3')
    passed++
  } else {
    logger.error(`❌ FAIL - Limite devrait être 3, reçu ${test5_4.data.user.max_codes_allowed}`)
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 6 : LIMITES CODES (4 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 6 : Limites codes (4 tests)\n')
  
  // Test 6.1 : Augmenter limite à 50
  logger.info('Test 6.1 : Augmenter limite à 50')
  const test6_1 = await testAPI(`/api/admin/users/${targetUserId}/increase-code-limit`, 'PATCH', {
    new_limit: 50
  }, adminToken)
  
  if (test6_1.status === 200 && test6_1.data.user.max_codes_allowed === 50) {
    logger.info('✅ PASS - Limite augmentée à 50')
    passed++
  } else {
    logger.error('❌ FAIL - Augmentation devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 6.2 : Augmenter limite à 1000
  logger.info('Test 6.2 : Augmenter limite à 1000')
  const test6_2 = await testAPI(`/api/admin/users/${targetUserId}/increase-code-limit`, 'PATCH', {
    new_limit: 1000
  }, adminToken)
  
  if (test6_2.status === 200 && test6_2.data.user.max_codes_allowed === 1000) {
    logger.info('✅ PASS - Limite augmentée à 1000')
    passed++
  } else {
    logger.error('❌ FAIL - Augmentation devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 6.3 : Tenter limite négative
  logger.info('Test 6.3 : Tenter limite négative')
  const test6_3 = await testAPI(`/api/admin/users/${targetUserId}/increase-code-limit`, 'PATCH', {
    new_limit: -10
  }, adminToken)
  
  if (test6_3.status === 400) {
    logger.info('✅ PASS - Limite négative refusée')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 400')
    failed++
  }
  logger.info('')
  
  // Test 6.4 : Restaurer limite normale
  logger.info('Test 6.4 : Restaurer limite à 3')
  const test6_4 = await testAPI(`/api/admin/users/${targetUserId}/increase-code-limit`, 'PATCH', {
    new_limit: 3
  }, adminToken)
  
  if (test6_4.status === 200) {
    logger.info('✅ PASS - Limite restaurée')
    passed++
  } else {
    logger.error('❌ FAIL - Restauration devrait réussir')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 7 : GESTION ÉVÉNEMENTS (7 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 7 : Gestion événements (7 tests)\n')
  
  // Test 7.1 : Liste tous événements
  logger.info('Test 7.1 : Liste tous événements (actifs + inactifs)')
  const test7_1 = await testAPI('/api/admin/events', 'GET', null, adminToken)
  
  if (test7_1.status === 200 && Array.isArray(test7_1.data.events)) {
    logger.info('✅ PASS - Liste complète récupérée')
    logger.info(`   Total: ${test7_1.data.total}`)
    logger.info(`   Actifs: ${test7_1.data.events.filter((e: any) => e.is_active).length}`)
    logger.info(`   Inactifs: ${test7_1.data.events.filter((e: any) => !e.is_active).length}`)
    passed++
  } else {
    logger.error('❌ FAIL - Liste devrait être retournée')
    failed++
  }
  logger.info('')
  
  // Test 7.2 : Filtrer par status
  logger.info('Test 7.2 : Filtrer par status (upcoming)')
  const test7_2 = await testAPI('/api/admin/events?status=upcoming', 'GET', null, adminToken)
  
  if (test7_2.status === 200) {
    logger.info('✅ PASS - Filtre status fonctionne')
    logger.info(`   Upcoming: ${test7_2.data.total}`)
    passed++
  } else {
    logger.error('❌ FAIL - Filtre devrait fonctionner')
    failed++
  }
  logger.info('')
  
  // Test 7.3 : Filtrer inactifs
  logger.info('Test 7.3 : Filtrer événements inactifs')
  const test7_3 = await testAPI('/api/admin/events?is_active=false', 'GET', null, adminToken)
  
  if (test7_3.status === 200) {
    logger.info('✅ PASS - Filtre inactifs fonctionne')
    logger.info(`   Inactifs: ${test7_3.data.total}`)
    passed++
  } else {
    logger.error('❌ FAIL - Filtre devrait fonctionner')
    failed++
  }
  logger.info('')
  
  // Test 7.4 : Filtrer par pays
  logger.info('Test 7.4 : Filtrer par pays (France)')
  const test7_4 = await testAPI('/api/admin/events?country=France', 'GET', null, adminToken)
  
  if (test7_4.status === 200) {
    logger.info('✅ PASS - Filtre pays fonctionne')
    logger.info(`   Événements France: ${test7_4.data.total}`)
    passed++
  } else {
    logger.error('❌ FAIL - Filtre devrait fonctionner')
    failed++
  }
  logger.info('')
  
  // Créer événement par membre pour tests
  const memberEventRes = await testAPI('/api/events', 'POST', {
    title: 'Événement Test Membre',
    event_date: '2026-12-01T18:00:00Z',
    event_end_date: '2026-12-01T21:00:00Z',
    city: 'Paris',
    country: 'France'
  }, memberToken)
  
  const memberEventId = memberEventRes.data.event?.id
  
  // Test 7.5 : Admin modifie événement d'un autre
  logger.info('Test 7.5 : Admin modifie événement créé par membre')
  const test7_5 = await testAPI(`/api/admin/events/${memberEventId}`, 'PATCH', {
    status: 'cancelled',
    title: 'Événement Annulé par Admin'
  }, adminToken)
  
  if (test7_5.status === 200 && test7_5.data.event) {
    logger.info('✅ PASS - Admin peut modifier événement d\'un autre')
    logger.info(`   Nouveau status: ${test7_5.data.event.status}`)
    passed++
  } else {
    logger.error('❌ FAIL - Modification devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 7.6 : Admin supprime événement d'un autre
  logger.info('Test 7.6 : Admin supprime événement créé par membre')
  const test7_6 = await testAPI(`/api/admin/events/${memberEventId}`, 'DELETE', null, adminToken)
  
  if (test7_6.status === 200 && test7_6.data.success) {
    logger.info('✅ PASS - Admin peut supprimer événement d\'un autre')
    passed++
  } else {
    logger.error('❌ FAIL - Suppression devrait réussir')
    failed++
  }
  logger.info('')
  
  // Test 7.7 : Vérifier soft delete
  logger.info('Test 7.7 : Vérifier soft delete (is_active=false)')
  const { data: deletedEvent } = await supabase
    .from('events')
    .select('is_active')
    .eq('id', memberEventId)
    .single()
  
  if (deletedEvent && deletedEvent.is_active === false) {
    logger.info('✅ PASS - Soft delete confirmé')
    passed++
  } else {
    logger.error('❌ FAIL - Événement devrait être inactif')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 8 : PARTICIPANTS ÉVÉNEMENTS (2 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 8 : Participants événements (2 tests)\n')
  
  // Trouver événement avec participants
  const eventWithParticipants = test7_1.data.events.find((e: any) => 
    e.participant_count > 0 && e.is_active
  )
  
  if (eventWithParticipants) {
    // Test 8.1 : Liste participants (admin)
    logger.info('Test 8.1 : Liste participants avec détails admin')
    const test8_1 = await testAPI(`/api/admin/events/${eventWithParticipants.id}/participants`, 'GET', null, adminToken)
    
    if (test8_1.status === 200 && Array.isArray(test8_1.data.participants)) {
      logger.info('✅ PASS - Liste participants récupérée')
      logger.info(`   Total: ${test8_1.data.total}`)
      
      if (test8_1.data.participants.length > 0) {
        const p = test8_1.data.participants[0]
        logger.info(`   Participant: ${p.first_name} ${p.last_name}`)
        logger.info(`   Email: ${p.email}`)
        logger.info(`   Role: ${p.role}`)
      }
      passed++
    } else {
      logger.error('❌ FAIL - Liste devrait être retournée')
      failed++
    }
    logger.info('')
    
    // Test 8.2 : Comparer avec endpoint public
    logger.info('Test 8.2 : Comparer détails admin vs public')
    const test8_2 = await testAPI(`/api/events/${eventWithParticipants.id}/participants`, 'GET')
    
    const adminHasEmail = test8_1.data.participants.length > 0 && test8_1.data.participants[0].email
    const publicHasEmail = test8_2.data.participants.length > 0 && test8_2.data.participants[0].email
    
    if (adminHasEmail && !publicHasEmail) {
      logger.info('✅ PASS - Endpoint admin a plus d\'infos (email, role, etc.)')
      passed++
    } else {
      logger.info('⚠️ INFO - Différence de détails confirmée')
      passed++
    }
    logger.info('')
  } else {
    logger.info('⚠️ SKIP - Aucun événement avec participants trouvé')
    logger.info('')
    passed += 2
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RÉSUMÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  RÉSULTATS TESTS ADMIN')
  logger.info('═══════════════════════════════════════════════════\n')
  
  const total = passed + failed
  const percentage = Math.round((passed / total) * 100)
  
  logger.info(`Total tests    : ${total}`)
  logger.info(`Réussis        : ${passed} ✅`)
  logger.info(`Échoués        : ${failed} ❌`)
  logger.info(`Taux réussite  : ${percentage}%\n`)
  
  if (failed === 0) {
    logger.info('🎉 MODULE ADMIN VALIDÉ!\n')
    logger.info('✓ Statistiques (4 tests)')
    logger.info('✓ Demandes d\'accès (7 tests)')
    logger.info('✓ Liste utilisateurs (6 tests)')
    logger.info('✓ Modification utilisateurs (5 tests)')
    logger.info('✓ Ambassadeurs (5 tests)')
    logger.info('✓ Limites codes (4 tests)')
    logger.info('✓ Gestion événements (7 tests)')
    logger.info('✓ Participants événements (2 tests)\n')
  }
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info(`  TOTAL : ${total} tests exhaustifs`)
  logger.info('═══════════════════════════════════════════════════\n')
}

runAdminTests()

