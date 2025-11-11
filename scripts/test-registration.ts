import { logger } from '../src/utils/logger'

const API_BASE = 'http://localhost:3001'

// Données de test réelles (récupérées depuis la base)
const TEST_SCHOOL_ID = '7f081ca5-2e61-44dd-be1a-2cf43137f67f' // PML Gabon
const TEST_CODE = 'ADMIN-GA-2001'
const TEST_CODE_SCHOOL_ID = '7f081ca5-2e61-44dd-be1a-2cf43137f67f'
const TEST_CODE_ENTRY_YEAR = '2000'

async function testAPI(endpoint: string, method: string, body?: any) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
  
  const data = await res.json()
  return { status: res.status, data }
}

async function runTests() {
  logger.info('═══════════════════════════════════════')
  logger.info('  TESTS MODULE REGISTRATION')
  logger.info('═══════════════════════════════════════\n')
  
  let passed = 0
  let failed = 0
  
  // Test 1: Check promo n'existe pas
  logger.info('Test 1: Check school promo (n\'existe pas)')
  const test1 = await testAPI('/api/register/check-school-promo', 'POST', {
    school_id: TEST_SCHOOL_ID,
    entry_year: '1999'
  })
  
  if (test1.status === 200 && test1.data.exists === false) {
    logger.info('✅ PASS - Promo n\'existe pas\n')
    passed++
  } else {
    logger.error('❌ FAIL - Résultat inattendu:', test1.data, '\n')
    failed++
  }
  
  // Test 2: Verify code invalide
  logger.info('Test 2: Verify invitation code (invalide)')
  const test2 = await testAPI('/api/register/verify-invitation-code', 'POST', {
    code: 'CODE-INVALIDE-123',
    school_id: TEST_SCHOOL_ID,
    entry_year: '2001'
  })
  
  if (test2.status === 200 && test2.data.valid === false) {
    logger.info('✅ PASS - Code invalide détecté\n')
    passed++
  } else {
    logger.error('❌ FAIL - Résultat inattendu:', test2.data, '\n')
    failed++
  }
  
  // Test 3: Verify code valide (utiliser un vrai code admin)
  logger.info('Test 3: Verify invitation code (valide)')
  const test3 = await testAPI('/api/register/verify-invitation-code', 'POST', {
    code: TEST_CODE,
    school_id: TEST_CODE_SCHOOL_ID,
    entry_year: TEST_CODE_ENTRY_YEAR
  })
  
  if (test3.status === 200 && test3.data.valid === true) {
    logger.info('✅ PASS - Code valide reconnu\n')
    passed++
  } else {
    logger.error('❌ FAIL - Code devrait être valide:', test3.data, '\n')
    failed++
  }
  
  // Résumé
  logger.info('═══════════════════════════════════════')
  logger.info(`Total: ${passed + failed}`)
  logger.info(`Réussis: ${passed} ✅`)
  logger.info(`Échoués: ${failed} ❌`)
  logger.info('═══════════════════════════════════════\n')
  
  if (failed === 0) {
    logger.info('🎉 Module Registration VALIDÉ!\n')
  }
}

runTests().catch(console.error)

