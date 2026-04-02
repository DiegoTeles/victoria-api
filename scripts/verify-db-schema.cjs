const { Client } = require('pg');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    process.exit(1);
  }
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const need = ['artworks', 'categories'];
    for (const t of need) {
      const r = await client.query(
        `select 1 from information_schema.tables where table_schema = 'public' and table_name = $1`,
        [t],
      );
      if (r.rowCount === 0) {
        process.stderr.write(`Schema verification failed: missing table ${t}\n`);
        process.exit(1);
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  process.stderr.write(String(e && e.message ? e.message : e) + '\n');
  process.exit(1);
});
