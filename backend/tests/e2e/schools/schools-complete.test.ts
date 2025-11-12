import { logger } from '../../../src/utils/logger'

const API_BASE = 'http://localhost:3001'

async function testAPI(endpoint: string) {
  const res = await fetch(`${API_BASE}${endpoint}`)
  return { status: res.status, data: await res.json() }
}

async function runSchoolsTests() {
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  TESTS MODULE SCHOOLS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  let passed = 0
  let failed = 0
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 1 : LISTE ÉCOLES (3 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 1 : Liste écoles (3 tests)\n')
  
  // Test 1.1 : Liste toutes les écoles
  logger.info('Test 1.1 : Liste toutes les écoles (public, NO AUTH)')
  const test1_1 = await testAPI('/api/schools')
  
  if (test1_1.status === 200 && Array.isArray(test1_1.data.schools)) {
    logger.info('✅ PASS - Liste récupérée')
    logger.info(`   Total écoles: ${test1_1.data.total}`)
    logger.info(`   École 1: ${test1_1.data.schools[0]?.name_fr}`)
    
    // Vérifier pas de données personnelles
    const hasNoPersonalData = !test1_1.data.schools.some((s: any) => 
      s.members || s.member_names || s.emails
    )
    
    if (hasNoPersonalData) {
      logger.info('   ✓ Aucune donnée personnelle exposée')
      passed++
    } else {
      logger.error('   ✗ Données personnelles trouvées')
      failed++
    }
  } else {
    logger.error('❌ FAIL - Liste devrait être retournée')
    failed++
  }
  logger.info('')
  
  // Test 1.2 : Filtrer par pays
  logger.info('Test 1.2 : Filtrer écoles par pays (Gabon)')
  const test1_2 = await testAPI('/api/schools?country=Gabon')
  
  if (test1_2.status === 200) {
    const allGabon = test1_2.data.schools.every((s: any) => s.country === 'Gabon')
    
    if (allGabon || test1_2.data.schools.length === 0) {
      logger.info('✅ PASS - Filtre pays fonctionne')
      logger.info(`   Écoles au Gabon: ${test1_2.data.total}`)
      passed++
    } else {
      logger.error('❌ FAIL - Certaines écoles ne sont pas au Gabon')
      failed++
    }
  } else {
    logger.error('❌ FAIL - Requête devrait réussir')
    failed++
  }
  logger.info('')
  
  // Récupérer ID d'une école pour tests suivants
  const schoolId = test1_1.data.schools[0]?.id
  
  // Test 1.3 : École inexistante
  logger.info('Test 1.3 : Récupérer école inexistante')
  const test1_3 = await testAPI('/api/schools/00000000-0000-0000-0000-000000000000')
  
  if (test1_3.status === 404) {
    logger.info('✅ PASS - École inexistante retourne 404')
    passed++
  } else {
    logger.error('❌ FAIL - Devrait retourner 404')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 2 : DÉTAILS ÉCOLE (2 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 2 : Détails école (2 tests)\n')
  
  // Test 2.1 : Détails école
  logger.info('Test 2.1 : Récupérer détails école')
  const test2_1 = await testAPI(`/api/schools/${schoolId}`)
  
  if (test2_1.status === 200 && test2_1.data.id) {
    logger.info('✅ PASS - Détails récupérés')
    logger.info(`   École: ${test2_1.data.name_fr}`)
    logger.info(`   Pays: ${test2_1.data.country}`)
    logger.info(`   Membres: ${test2_1.data.total_members}`)
    logger.info(`   Ambassadeurs: ${test2_1.data.total_ambassadors}`)
    passed++
  } else {
    logger.error('❌ FAIL - Détails devraient être retournés')
    failed++
  }
  logger.info('')
  
  // Test 2.2 : Vérifier stats agrégées uniquement
  logger.info('Test 2.2 : Vérifier absence données personnelles')
  const hasStats = test2_1.data.total_members !== undefined
  const hasNoNames = !test2_1.data.member_names && !test2_1.data.members
  
  if (hasStats && hasNoNames) {
    logger.info('✅ PASS - Stats agrégées uniquement, pas de noms')
    passed++
  } else {
    logger.error('❌ FAIL - Données personnelles ou stats manquantes')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GROUPE 3 : STATISTIQUES (1 test)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('📋 GROUPE 3 : Statistiques école (1 test)\n')
  
  // Test 3.1 : Stats détaillées
  logger.info('Test 3.1 : Statistiques détaillées école')
  const test3_1 = await testAPI(`/api/schools/${schoolId}/stats`)
  
  if (test3_1.status === 200 && test3_1.data.statistics) {
    logger.info('✅ PASS - Statistiques récupérées')
    logger.info(`   Total membres: ${test3_1.data.statistics.total_members}`)
    logger.info(`   Par année: ${test3_1.data.statistics.by_entry_year?.length || 0} entrées`)
    logger.info(`   Par pays: ${test3_1.data.statistics.by_current_country?.length || 0} pays`)
    passed++
  } else {
    logger.error('❌ FAIL - Statistiques devraient être retournées')
    failed++
  }
  logger.info('')
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RÉSUMÉ
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  RÉSULTATS TESTS SCHOOLS')
  logger.info('═══════════════════════════════════════════════════\n')
  
  const total = passed + failed
  const percentage = Math.round((passed / total) * 100)
  
  logger.info(`Total tests    : ${total}`)
  logger.info(`Réussis        : ${passed} ✅`)
  logger.info(`Échoués        : ${failed} ❌`)
  logger.info(`Taux réussite  : ${percentage}%\n`)
  
  if (failed === 0) {
    logger.info('🎉 MODULE SCHOOLS VALIDÉ!\n')
  }
}

runSchoolsTests()

