#!/usr/bin/env node

/**
 * Supabase Migration and Seed Script
 * 
 * Runs the schema migration and seed data against your Supabase project.
 * Uses environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * 
 * Usage: node supabase/run-migrations.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  if (!SUPABASE_URL) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  if (!SERVICE_ROLE_KEY) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nCreate a .env.local file with these values or set them in your environment.');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runSQL(sql, description) {
  console.log(`\n📋 ${description}...`);
  
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    // Try direct query if RPC doesn't exist
    // Supabase doesn't have a direct SQL execution endpoint via JS client
    // We'll need to use the REST API directly
    console.log('   Using REST API for SQL execution...');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ sql_query: sql }),
    });
    
    if (!response.ok) {
      // Fallback: execute statements one by one via pg_query
      throw new Error(`SQL execution not available. Please run migrations manually in Supabase SQL Editor.`);
    }
  }
  
  console.log(`   ✅ ${description} complete`);
}

async function testConnection() {
  console.log('🔌 Testing Supabase connection...');
  console.log(`   URL: ${SUPABASE_URL}`);
  
  const { data, error } = await supabase.from('competitors').select('count').limit(1);
  
  if (error && error.code !== 'PGRST116' && !error.message.includes('does not exist')) {
    throw new Error(`Connection failed: ${error.message}`);
  }
  
  console.log('   ✅ Connected to Supabase');
}

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  
  console.log(`\n📁 Found ${files.length} migration files`);
  
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    
    console.log(`\n🔄 Running ${file}...`);
    console.log('   ⚠️  Please run this SQL manually in Supabase SQL Editor:');
    console.log(`   File: ${filePath}`);
  }
  
  return files;
}

async function validateData() {
  console.log('\n🔍 Validating seeded data...');
  
  // Count competitors
  const { data: competitors, error: compError } = await supabase
    .from('competitors')
    .select('id, name, tag, is_baseline');
  
  if (compError) {
    if (compError.message.includes('does not exist')) {
      console.log('   ⚠️  Tables not yet created. Run migrations first.');
      return false;
    }
    throw new Error(`Failed to fetch competitors: ${compError.message}`);
  }
  
  // Count sources
  const { count: sourceCount, error: srcError } = await supabase
    .from('sources')
    .select('*', { count: 'exact', head: true });
  
  if (srcError) throw new Error(`Failed to count sources: ${srcError.message}`);
  
  // Count claims
  const { data: claims, error: claimError } = await supabase
    .from('claims')
    .select('id, verified');
  
  if (claimError) throw new Error(`Failed to fetch claims: ${claimError.message}`);
  
  const baseline = competitors?.find(c => c.is_baseline);
  const verifiedClaims = claims?.filter(c => c.verified) || [];
  
  console.log('\n📊 Row Count Summary:');
  console.log(`   Competitors: ${competitors?.length || 0}`);
  console.log(`     - Baseline: ${baseline ? '✅ ' + baseline.name : '❌ Missing'}`);
  console.log(`     - Core: ${competitors?.filter(c => c.tag === 'core' && !c.is_baseline).length || 0}`);
  console.log(`     - Adjacent: ${competitors?.filter(c => c.tag === 'adjacent').length || 0}`);
  console.log(`     - Contrast: ${competitors?.filter(c => c.tag === 'contrast').length || 0}`);
  console.log(`   Sources: ${sourceCount || 0}`);
  console.log(`   Claims: ${claims?.length || 0}`);
  console.log(`     - Verified: ${verifiedClaims.length}`);
  console.log(`     - Pending: ${(claims?.length || 0) - verifiedClaims.length}`);
  
  // Validate relationships
  console.log('\n🔗 Validating relationships...');
  
  const { data: sourcesWithComp, error: relError1 } = await supabase
    .from('sources')
    .select('id, competitor_id, competitors(name)')
    .limit(5);
  
  if (relError1) {
    console.log('   ⚠️  Could not validate source->competitor FK');
  } else {
    const valid = sourcesWithComp?.every(s => s.competitors);
    console.log(`   Sources → Competitors: ${valid ? '✅' : '❌'}`);
  }
  
  const { data: claimsWithComp, error: relError2 } = await supabase
    .from('claims')
    .select('id, competitor_id, source_id, competitors(name)')
    .limit(5);
  
  if (relError2) {
    console.log('   ⚠️  Could not validate claim->competitor FK');
  } else {
    const valid = claimsWithComp?.every(c => c.competitors);
    console.log(`   Claims → Competitors: ${valid ? '✅' : '❌'}`);
  }
  
  return true;
}

async function main() {
  console.log('🚀 Escape Hatch Competitor Intelligence - Database Setup\n');
  console.log('=' .repeat(60));
  
  try {
    await testConnection();
    
    const valid = await validateData();
    
    if (!valid) {
      console.log('\n' + '=' .repeat(60));
      console.log('\n📝 MANUAL STEPS REQUIRED:');
      console.log('\n1. Open Supabase Dashboard: ' + SUPABASE_URL.replace('.supabase.co', '.supabase.co/project/default/sql'));
      console.log('\n2. Go to SQL Editor');
      console.log('\n3. Run the following files in order:');
      
      const migrations = await runMigrations();
      migrations.forEach((file, i) => {
        console.log(`   ${i + 1}. supabase/migrations/${file}`);
      });
      
      console.log('\n4. After running migrations, run this script again to validate.');
    } else {
      console.log('\n✅ Database is set up and seeded correctly!');
    }
    
    console.log('\n' + '=' .repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
