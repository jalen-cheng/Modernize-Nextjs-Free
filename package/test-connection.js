const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hlxpccffiulkaoxpotvn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseHBjY2ZmaXVsa2FveHBvdHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NTkwNzQsImV4cCI6MjA1MjIzNTA3NH0.Kwn6VvQwkvq-dtsDceMBquRmRMTV_API_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test patients table
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .limit(3);

    if (error) {
      console.error('Patients query error:', error);
      return;
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log(`Found ${patients?.length || 0} patients`);
    
    if (patients && patients.length > 0) {
      console.log('Sample patient:', patients[0]);
    }

    // Test call_log table
    const { data: callLogs, error: callError } = await supabase
      .from('call_log')
      .select('*')
      .limit(3);

    if (callError) {
      console.error('Call log query error:', callError);
      return;
    }

    console.log(`Found ${callLogs?.length || 0} call logs`);
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();
