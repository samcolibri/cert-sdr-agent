// Corpus indexer — reads kb/corpus/*.txt (gitignored, extracted from the 39 course docs),
// chunks them, and writes kb/index.json (gitignored): the PRIVATE full-fidelity retrieval
// index used by the local server. Lexical scoring (BM25-style) — no embedding API, no cost.
// Usage: node kb/build_index.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'corpus');
const CHUNK = 1600, OVERLAP = 200;

const STOP = new Set('the a an and or of to in for with on at by is are was be as this that it from can will your you not have has'.split(' '));
export const tokenize = s => (s.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []).filter(w => !STOP.has(w));

const docs = [];
for (const f of readdirSync(SRC).filter(f => f.endsWith('.txt'))) {
  const raw = readFileSync(join(SRC, f), 'utf-8').replace(/\s+/g, ' ').trim();
  if (raw.length < 300) { console.log(`SKIP (image-only, ${raw.length} chars): ${f}`); continue; }
  const name = basename(f, '.txt');
  const chunks = [];
  for (let i = 0; i < raw.length; i += CHUNK - OVERLAP) {
    const text = raw.slice(i, i + CHUNK);
    if (text.trim().length > 200) chunks.push(text);
    if (chunks.length >= 500) break; // cap pathological docs
  }
  docs.push({ doc: name, chunks });
}

let id = 0;
const index = [];
const df = {};
for (const d of docs) for (const text of d.chunks) {
  const terms = {};
  for (const t of tokenize(text)) terms[t] = (terms[t] || 0) + 1;
  for (const t of Object.keys(terms)) df[t] = (df[t] || 0) + 1;
  index.push({ id: id++, doc: d.doc, text, terms });
}
const N = index.length;
writeFileSync(join(HERE, 'index.json'), JSON.stringify({ built: new Date().toISOString(), N, df, chunks: index }));
console.log(`Indexed ${docs.length} docs → ${N} chunks → kb/index.json (${Math.round(JSON.stringify(index).length / 1e6)}MB, gitignored)`);
