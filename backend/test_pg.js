const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_HV0ObNKia5QS@ep-crimson-wind-ao8ql1e8-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});

async function test() {
  console.log("Connecting...");
  try {
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log("Connected successfully:", res.rows[0]);
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

test();
