// ============================================================
// INEED · Supabase Migration Deployer
// Führt alle Migrations der Reihe nach über die Management API aus
// ============================================================

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

const PROJECT_REF   = process.env.SUPABASE_PROJECT_REF  || '';
const ACCESS_TOKEN  = process.env.SUPABASE_ACCESS_TOKEN || '';
const API_URL       = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';

async function runQuery(sql, label) {
  const res = await fetch(API_URL, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok || body.error || body.message) {
    const msg = body.error || body.message || JSON.stringify(body);
    throw new Error(msg);
  }
  return body;
}

async function deploy() {
  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║   INEED · Supabase Schema Deploy     ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════╝${RESET}\n`);
  console.log(`${YELLOW}Projekt:${RESET} ${PROJECT_REF}`);
  console.log(`${YELLOW}Ziel:   ${RESET} https://${PROJECT_REF}.supabase.co\n`);

  // ── Migrations ──────────────────────────────────────────────
  const migrationsDir = join(__dir, 'migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`${BOLD}Migrations (${files.length} Dateien):${RESET}`);

  let ok = 0;
  let failed = 0;

  for (const file of files) {
    const sql   = readFileSync(join(migrationsDir, file), 'utf8');
    const label = file.replace('.sql', '');
    process.stdout.write(`  ${CYAN}▸${RESET} ${label.padEnd(35)} `);

    try {
      await runQuery(sql, label);
      console.log(`${GREEN}✓ OK${RESET}`);
      ok++;
    } catch (err) {
      // "already exists" Fehler ignorieren (idempotent re-run)
      const msg = err.message || '';
      if (
        msg.includes('already exists') ||
        msg.includes('duplicate') ||
        msg.includes('multiple statements')
      ) {
        console.log(`${YELLOW}⚠ bereits vorhanden (übersprungen)${RESET}`);
        ok++;
      } else {
        console.log(`${RED}✗ FEHLER${RESET}`);
        console.log(`    ${RED}${msg.split('\n')[0]}${RESET}`);
        failed++;
      }
    }
  }

  // ── Seed ────────────────────────────────────────────────────
  console.log(`\n${BOLD}Seed-Daten:${RESET}`);
  const seedDir  = join(__dir, 'seed');
  const seedFiles = readdirSync(seedDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of seedFiles) {
    const sql = readFileSync(join(seedDir, file), 'utf8');
    process.stdout.write(`  ${CYAN}▸${RESET} ${file.replace('.sql','').padEnd(35)} `);
    try {
      await runQuery(sql, file);
      console.log(`${GREEN}✓ OK${RESET}`);
      ok++;
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('already exists')) {
        console.log(`${YELLOW}⚠ bereits vorhanden (übersprungen)${RESET}`);
        ok++;
      } else {
        console.log(`${RED}✗ FEHLER${RESET}`);
        console.log(`    ${RED}${msg.split('\n')[0]}${RESET}`);
        failed++;
      }
    }
  }

  // ── Ergebnis ─────────────────────────────────────────────────
  console.log(`\n${BOLD}╔══════════════════════════════════════╗${RESET}`);
  if (failed === 0) {
    console.log(`${BOLD}${GREEN}║  ✓ Deploy erfolgreich                ║${RESET}`);
  } else {
    console.log(`${BOLD}${RED}║  ✗ Deploy mit Fehlern                ║${RESET}`);
  }
  console.log(`${BOLD}╚══════════════════════════════════════╝${RESET}`);
  console.log(`  Erfolgreich: ${GREEN}${ok}${RESET}  |  Fehler: ${failed > 0 ? RED : GREEN}${failed}${RESET}\n`);

  if (failed === 0) {
    console.log(`${GREEN}Nächste Schritte:${RESET}`);
    console.log(`  1. Access Token löschen: https://supabase.com/dashboard/account/tokens`);
    console.log(`  2. .env.local anlegen (aus .env.example)`);
    console.log(`  3. Admin-User in der DB auf role='admin' setzen\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

deploy().catch(err => {
  console.error(`\n${RED}Unerwarteter Fehler:${RESET}`, err.message);
  process.exit(1);
});
