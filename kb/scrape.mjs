// KB refresh pipeline (sandbox v1): re-fetches the public FM landing page and saves the raw text
// next to facts.json so a human (or a review step) can diff and update curated facts.
// Production version adds: change-diff → review flag (never silently changes live agent behavior),
// NetSuite/BenchPrep catalog sync, and course transcript ingestion (see ingest_transcripts.mjs).
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const URL = 'https://www.fhea.com/functional-medicine-certification/';

const res = await fetch(URL, { headers: { 'user-agent': 'cert-sdr-kb-refresh/0.1 (internal Colibri tool)' } });
if (!res.ok) { console.error(`Fetch failed: ${res.status}`); process.exit(1); }
let html = await res.text();
html = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, ' ');
const text = html.replace(/<[^>]*>/g, '\n')
  .replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, "'").replace(/&nbsp;/g, ' ')
  .split('\n').map(l => l.trim()).filter(l => l.length > 2)
  .filter((l, i, a) => a.indexOf(l) === i).join('\n');

mkdirSync(join(HERE, 'raw'), { recursive: true });
const out = join(HERE, 'raw', `landing-${new Date().toISOString().slice(0, 10)}.txt`);
writeFileSync(out, `# source: ${URL}\n# retrieved: ${new Date().toISOString()}\n\n${text}`);
console.log(`Saved ${text.split('\n').length} lines → ${out}\nDiff against kb/facts.json and update curated facts as needed.`);
