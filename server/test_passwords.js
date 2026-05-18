const { Client } = require('pg');

const commonPasswords = [
  'admin',
  '',
  'root',
  'password',
  '1234',
  '123456',
  '12345',
  '123',
  'admin123',
  'postgres123',
  'root123'
];

async function testPasswords() {
  console.log('Testing common developer passwords on local PostgreSQL...');
  
  for (const pwd of commonPasswords) {
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: pwd,
      database: 'postgres',
      connectionTimeoutMillis: 1000 // fast timeout
    });

    try {
      await client.connect();
      console.log(`\n=========================================`);
      console.log(`SUCCESS! Connected with password: "${pwd}"`);
      console.log(`=========================================\n`);
      await client.end();
      process.exit(0);
    } catch (err) {
      if (err.code === '28P01') {
        // Password authentication failed, continue testing
        process.stdout.write('.');
      } else {
        // Some other error (connection timeout, postgres not running, etc.)
        console.error(`\nConnection error with password "${pwd}":`, err.message);
      }
    }
  }
  
  console.log('\nAll common passwords tested. None succeeded.');
  process.exit(1);
}

testPasswords();
