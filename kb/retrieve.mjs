// Retrieval over kb/index.json — BM25-lite. Used by the local server per chat turn.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PATH = join(HERE, 'index.json');
let IDX = null;
if (existsSync(PATH)) IDX = JSON.parse(readFileSync(PATH, 'utf-8'));

const STOP = new Set('the a an and or of to in for with on at by is are was be as this that it from can will your you not have has what does do how why about course say says teach teaches module cover covers'.split(' '));
const tokenize = s => (s.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) || []).filter(w => !STOP.has(w));

export function retrieve(query, k = 4) {
  if (!IDX) return [];
  const q = tokenize(query);
  if (!q.length) return [];
  const scores = [];
  for (const c of IDX.chunks) {
    let s = 0;
    for (const t of q) {
      const tf = c.terms[t];
      if (tf) s += (tf / (tf + 1.2)) * Math.log(1 + (IDX.N - IDX.df[t] + 0.5) / (IDX.df[t] + 0.5));
    }
    if (s > 0) scores.push([s, c]);
  }
  scores.sort((a, b) => b[0] - a[0]);
  return scores.slice(0, k).map(([score, c]) => ({ doc: c.doc, score: +score.toFixed(2), text: c.text }));
}
export const indexInfo = () => IDX ? { chunks: IDX.N, built: IDX.built } : null;
