import { supabase } from '../src/config/database'
import { logger } from '../src/utils/logger'

async function testConnection() {
  logger.info('Testing Supabase connection...\n')
  
  try {
    // Test 1: Connection
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name_fr, country')
    
    if (schoolsError) throw schoolsError
    
    logger.info(`✅ Schools: ${schools?.length || 0} found`)
    schools?.forEach(s => logger.info(`   - ${s.name_fr} (${s.country})`))
    
    // Test 2: Invitation codes
    const { data: codes, error: codesError } = await supabase
      .from('invitation_codes')
      .select('code, school_id, entry_year, is_admin_code')
    
    if (codesError) throw codesError
    
    logger.info(`\n✅ Invitation codes: ${codes?.length || 0} found`)
    const adminCodes = codes?.filter(c => c.is_admin_code)
    logger.info(`   - Admin codes: ${adminCodes?.length || 0}`)
    
    // Test 3: Users
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    logger.info(`\n✅ Users: ${userCount || 0} found`)
    
    logger.info('\n🎉 All tests passed! Database is ready.\n')
    
  } catch (error) {
    logger.error('❌ Connection test failed:', error)
    process.exit(1)
  }
}

testConnection()

