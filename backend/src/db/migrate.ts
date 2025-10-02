import { promises as fs } from "fs";
import path from "path";
import { pool } from "./pool";

async function ensureMigrationsTable() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS public._migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      run_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );`
  );
}

async function getApplied(): Promise<Set<string>> {
  const { rows } = await pool.query<{ name: string }>(
    "SELECT name FROM public._migrations ORDER BY id"
  );
  return new Set(rows.map((r) => r.name));
}

async function applyMigration(filePath: string, name: string) {
  const sql = await fs.readFile(filePath, "utf8");
  await pool.query("BEGIN");
  try {
    await pool.query(sql);
    await pool.query("INSERT INTO public._migrations (name) VALUES ($1)", [name]);
    await pool.query("COMMIT");
    // eslint-disable-next-line no-console
    console.log(`Applied migration: ${name}`);
  } catch (e) {
    await pool.query("ROLLBACK");
    throw e;
  }
}

async function main() {
  await ensureMigrationsTable();
  const dir = path.join(__dirname, "migrations");
  const files = await fs.readdir(dir);
  const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();
  const applied = await getApplied();

  for (const f of sqlFiles) {
    if (!applied.has(f)) {
      await applyMigration(path.join(dir, f), f);
    }
  }
  // eslint-disable-next-line no-console
  console.log("Migrations complete");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

