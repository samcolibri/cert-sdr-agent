// Course content + lecture transcript ingestion (Aug 20 feedback: the KB must read the course itself).
// Drop files from Gail (txt/vtt/srt/md — one per module) into kb/transcripts/, then run:
//   node kb/ingest_transcripts.mjs
// Output: kb/transcripts/<module>.json — {module, chunks:[{text, idx}]} consumed by the advisor
// as a lookup source. Sandbox ships with this pipeline ready and the folder empty.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), 'transcripts');
mkdirSync(DIR, { recursive: true });

const CHUNK = 1200; // chars per chunk, sentence-aligned
const files = existsSync(DIR) ? readdirSync(DIR).filter(f => /\.(txt|vtt|srt|md)$/i.test(f)) : [];
if (!files.length) { console.log('kb/transcripts/ is empty — waiting on course content + transcripts from Gail.'); process.exit(0); }

for (const f of files) {
  let text = readFileSync(join(DIR, f), 'utf-8');
  if (/\.(vtt|srt)$/i.test(f)) text = text.replace(/^\d+$|^\d{2}:\d{2}.*-->.*$|^WEBVTT.*$/gm, ''); // strip cue metadata
  text = text.replace(/\s+/g, ' ').trim();
  const chunks = [];
  let buf = '';
  for (const s of text.split(/(?<=[.!?])\s+/)) {
    if ((buf + s).length > CHUNK) { chunks.push({ idx: chunks.length, text: buf.trim() }); buf = ''; }
    buf = buf ? `${buf} ${s}` : s;
  }
  if (buf.trim()) chunks.push({ idx: chunks.length, text: buf.trim() });
  const module_ = basename(f, extname(f));
  writeFileSync(join(DIR, `${module_}.json`), JSON.stringify({ module: module_, source: f, ingested: new Date().toISOString(), chunks }, null, 2));
  console.log(`${f} → ${chunks.length} chunks`);
}
