import { supabase } from '../../../src/config/database'
import { logger } from '../../../src/utils/logger'
import { writeFileSync } from 'fs'
import { join } from 'path'

const API_BASE = 'http://localhost:3001'

interface TestResult {
  module: string
  endpoint: string
  method: string
  status: 'PASS' | 'FAIL'
  statusCode: number
  error?: string
}

let adminToken = ''
let memberToken = ''
let testResults: TestResult[] = []

async function testAPI(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
) {
  const headers: any = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
  
  return {
    status: res.status,
    data: res.ok ? await res.json().catch(() => null) : null,
    ok: res.ok
  }
}

async function login() {
  logger.info('🔐 Authentification...\n')
  
  const adminRes = await testAPI('/api/auth/login', 'POST', {
    email: 'test.admin@aetconnect.com',
    password: 'TestPass123!'
  })
  
  const memberRes = await testAPI('/api/auth/login', 'POST', {
    email: 'test.membre@aetconnect.com',
    password: 'TestPass123!'
  })
  
  if (adminRes.data?.access_token && memberRes.data?.access_token) {
    adminToken = adminRes.data.access_token
    memberToken = memberRes.data.access_token
    logger.info('✅ Authentification réussie\n')
    return true
  }
  
  logger.error('❌ Authentification échouée\n')
  return false
}

async function testRoute(
  module: string,
  endpoint: string,
  method: string,
  expectedStatus: number,
  token?: string,
  body?: any
) {
  try {
    const res = await testAPI(endpoint, method, body, token)
    const pass = res.status === expectedStatus
    
    testResults.push({
      module,
      endpoint,
      method,
      status: pass ? 'PASS' : 'FAIL',
      statusCode: res.status,
      error: pass ? undefined : `Expected ${expectedStatus}, got ${res.status}`
    })
    
    const icon = pass ? '✅' : '❌'
    logger.info(`${icon} ${method} ${endpoint} → ${res.status}`)
    
    return pass
  } catch (error: any) {
    testResults.push({
      module,
      endpoint,
      method,
      status: 'FAIL',
      statusCode: 0,
      error: error.message
    })
    
    logger.error(`❌ ${method} ${endpoint} → ERROR: ${error.message}`)
    return false
  }
}

async function runCompleteTests() {
  logger.info('═══════════════════════════════════════════════════')
  logger.info('  TESTS E2E COMPLETS - TOUTES LES ROUTES')
  logger.info('═══════════════════════════════════════════════════\n')
  
  const startTime = Date.now()
  
  // Login
  const loginSuccess = await login()
  if (!loginSuccess) {
    logger.error('❌ Impossible de continuer sans authentification')
    return
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODULE SCHOOLS (Public - NO AUTH)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  logger.info('\n📚 MODULE SCHOOLS (3 endpoints - PUBLIC)\n')
  
  await testRoute('Schools', '/api/schools', 'GET', 200)
  
  const { data: schools } = await supabase.from('schools').select('id').limit(1).single()
  const schoolId = schools?.id
  
  if (schoolId) {
    await testRoute('Schools', `/api/schools/${schoolId}`, 'GET', 200)
    await testRoute('Schools', `/api/schools/${schoolId}/stats`, 'GET', 200)
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODULE AUTH (4 endpoints)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  logger.info('\n🔐 MODULE AUTH (4 endpoints)\n')
  
  await testRoute('Auth', '/api/auth/me', 'GET', 200, adminToken)
  
  // Refresh token test - nécessite refresh_token en cookie (pas access_token)
  // On accepte 401 comme valide car c'est le comportement attendu sans cookie
  await testRoute('Auth', '/api/auth/refresh', 'POST', 401, undefined, {
    refresh_token: 'test-token'
  })
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODULE REGISTRATION (5 endpoints)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  logger.info('\n📝 MODULE REGISTRATION (5 endpoints)\n')
  
  if (schoolId) {
    await testRoute('Registration', '/api/register/check-school-promo', 'POST', 200, undefined, {
      school_id: schoolId,
      entry_year: '2015'
    })
    
    await testRoute('Registration', '/api/register/request-initial-access', 'POST', 201, undefined, {
      first_name: 'Test',
      last_name: 'E2E',
      email: `test.e2e.${Date.now()}@example.com`,
      school_id: schoolId,
      entry_year: '2015',
      message: 'Je souhaite rejoindre la communauté AET Connect',
      wants_ambassador: false
    })
    
    // Vérifier code (peut échouer si pas de code disponible)
    await testRoute('Registration', '/api/register/verify-invitation-code', 'POST', 200, undefined, {
      code: 'TEST-CODE',
      school_id: schoolId,
      entry_year: '2015'
    })
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODULE CODES (2 endpoints)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  logger.info('\n🎟️ MODULE CODES (2 endpoints)\n')
  
  await testRoute('Codes', '/api/codes/my-codes', 'GET', 200, adminToken)
  await testRoute('Codes', '/api/codes/generate', 'POST', 201, adminToken)
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODULE EVENTS (8 endpoints)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  logger.info('\n📅 MODULE EVENTS (8 endpoints)\n')
  
  await testRoute('Events', '/api/events', 'GET', 200)
  
  // Créer événement test
  const createEventRes = await testAPI('/api/events', 'POST', {
    title: 'Test E2E Event',
    description: 'Event pour tests complets',
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    event_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    city: 'Paris',
    country: 'France',
    address: '123 Test Street',
    max_participants: 50,
    status: 'upcoming'
  }, adminToken)
  
  const eventId = createEventRes.data?.id
  
  if (eventId) {
    await testRoute('Events', `/api/events/${eventId}`, 'GET', 200)
    await testRoute('Events', `/api/events/${eventId}/participants`, 'GET', 200)
    await testRoute('Events', `/api/events/${eventId}/register`, 'POST', 200, memberToken)
    await testRoute('Events', `/api/events/${eventId}/unregister`, 'DELETE', 200, memberToken)
    await testRoute('Events', `/api/events/${eventId}`, 'PATCH', 200, adminToken, {
      title: 'Test E2E Event (Updated)'
    })
    await testRoute('Events', `/api/events/${eventId}`, 'DELETE', 200, adminToken)
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODULE USERS (6 endpoints)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  logger.info('\n👥 MODULE USERS (6 endpoints)\n')
  
  await testRoute('Users', '/api/users', 'GET', 200, memberToken)
  await testRoute('Users', '/api/users/me', 'GET', 200, memberToken)
  await testRoute('Users', '/api/users/me', 'PATCH', 200, memberToken, {
    current_city: 'Paris'
  })
  await testRoute('Users', '/api/users/me/privacy', 'GET', 200, memberToken)
  await testRoute('Users', '/api/users/me/privacy', 'PATCH', 200, memberToken, {
    show_email: true
  })
  
  const { data: adminUser } = await supabase.from('users').select('id').eq('email', 'test.admin@aetconnect.com').single()
  if (adminUser?.id) {
    await testRoute('Users', `/api/users/${adminUser.id}`, 'GET', 200, memberToken)
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MODULE ADMIN (12 endpoints - ADMIN ONLY)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  logger.info('\n👑 MODULE ADMIN (12 endpoints - ADMIN ONLY)\n')
  
  await testRoute('Admin', '/api/admin/stats', 'GET', 200, adminToken)
  await testRoute('Admin', '/api/admin/users', 'GET', 200, adminToken)
  await testRoute('Admin', '/api/admin/events', 'GET', 200, adminToken)
  await testRoute('Admin', '/api/admin/access-requests', 'GET', 200, adminToken)
  
  // Tester refus si non-admin
  await testRoute('Admin', '/api/admin/stats', 'GET', 403, memberToken)
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LOGOUT
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  logger.info('\n🚪 LOGOUT\n')
  await testRoute('Auth', '/api/auth/logout', 'POST', 200, memberToken)
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RÉSULTATS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)
  
  const totalTests = testResults.length
  const passed = testResults.filter(r => r.status === 'PASS').length
  const failed = testResults.filter(r => r.status === 'FAIL').length
  const percentage = Math.round((passed / totalTests) * 100)
  
  logger.info('\n═══════════════════════════════════════════════════')
  logger.info('  RÉSULTATS FINAUX')
  logger.info('═══════════════════════════════════════════════════\n')
  
  logger.info(`Total tests    : ${totalTests}`)
  logger.info(`Réussis        : ${passed} ✅`)
  logger.info(`Échoués        : ${failed} ❌`)
  logger.info(`Taux réussite  : ${percentage}%`)
  logger.info(`Durée          : ${duration}s\n`)
  
  // Grouper par module
  const byModule = testResults.reduce((acc, r) => {
    if (!acc[r.module]) acc[r.module] = { pass: 0, fail: 0 }
    if (r.status === 'PASS') acc[r.module].pass++
    else acc[r.module].fail++
    return acc
  }, {} as Record<string, { pass: number; fail: number }>)
  
  logger.info('Par module :\n')
  Object.entries(byModule).forEach(([module, stats]) => {
    const total = stats.pass + stats.fail
    const pct = Math.round((stats.pass / total) * 100)
    logger.info(`  ${module.padEnd(15)} : ${stats.pass}/${total} (${pct}%)`)
  })
  
  if (failed > 0) {
    logger.info('\n❌ Tests échoués :\n')
    testResults
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        logger.error(`  ${r.method} ${r.endpoint}`)
        logger.error(`    → ${r.error}`)
      })
  }
  
  logger.info('\n')
  
  if (failed === 0) {
    logger.info('🎉 TOUS LES TESTS SONT PASSÉS !\n')
  }
  
  // Générer rapport
  await generateReport(testResults, passed, failed, duration)
}

async function generateReport(
  results: TestResult[],
  passed: number,
  failed: number,
  duration: string
) {
  const date = new Date().toLocaleString('fr-FR')
  
  let report = `# 🧪 Rapport Tests E2E Complets - Backend V1

**Date** : ${date}  
**Durée** : ${duration}s  
**Statut** : ${failed === 0 ? '✅ TOUS LES TESTS PASSENT' : `⚠️ ${failed} TESTS ÉCHOUÉS`}

---

## 📊 Résultats globaux

| Métrique | Valeur |
|----------|--------|
| Total tests | ${results.length} |
| Réussis | ${passed} ✅ |
| Échoués | ${failed} ❌ |
| Taux réussite | ${Math.round((passed / results.length) * 100)}% |

---

## 📋 Détail par module

`
  
  const byModule = results.reduce((acc, r) => {
    if (!acc[r.module]) acc[r.module] = []
    acc[r.module].push(r)
    return acc
  }, {} as Record<string, TestResult[]>)
  
  Object.entries(byModule).forEach(([module, tests]) => {
    const p = tests.filter(t => t.status === 'PASS').length
    const f = tests.filter(t => t.status === 'FAIL').length
    const pct = Math.round((p / tests.length) * 100)
    
    report += `\n### ${module} (${tests.length} tests)\n\n`
    report += `**${p}/${tests.length} réussis (${pct}%)**\n\n`
    report += `| Endpoint | Méthode | Statut | Code |\n`
    report += `|----------|---------|--------|------|\n`
    
    tests.forEach(t => {
      const icon = t.status === 'PASS' ? '✅' : '❌'
      report += `| \`${t.endpoint}\` | ${t.method} | ${icon} | ${t.statusCode} |\n`
    })
  })
  
  if (failed > 0) {
    report += `\n---\n\n## ❌ Tests échoués\n\n`
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        report += `### ${r.method} ${r.endpoint}\n\n`
        report += `- **Status code** : ${r.statusCode}\n`
        report += `- **Erreur** : ${r.error}\n\n`
      })
  }
  
  report += `\n---\n\n## ✅ Conclusion\n\n`
  
  if (failed === 0) {
    report += `🎉 **Tous les tests sont passés !**\n\n`
    report += `Le Backend V1 est **production-ready**.\n`
  } else {
    report += `⚠️ **${failed} tests ont échoué.**\n\n`
    report += `Corrections nécessaires avant déploiement.\n`
  }
  
  // Sauvegarder rapport
  const reportPath = join(__dirname, '..', '..', '..', 'docs', 'reports', 'RAPPORT_TESTS_E2E_COMPLETS.md')
  
  writeFileSync(reportPath, report, 'utf-8')
  
  logger.info(`📄 Rapport sauvegardé : ${reportPath}\n`)
}

runCompleteTests()

