import fs from 'node:fs';
import path from 'node:path';

let loaded = false;

export function loadEnv() {
  if (loaded) return;
  loaded = true;

  const candidates = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'Site', '.env.local'),
    path.resolve(process.cwd(), '..', '.env.local'),
  ];

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (e) {
        // Ignora silenciosamente se não conseguir ler arquivo
      }
    }
  }
}

// Carrega imediatamente ao importar
loadEnv();
