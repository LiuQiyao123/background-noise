import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src');
const CLOSE = String.fromCharCode(60, 47, 100, 105, 118, 62);

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) {
      let c = fs.readFileSync(p, 'utf8');
      let n = c.replaceAll('<motion', '<div').replaceAll('</motion>', CLOSE);
      // fix broken tags like </motion> or unclosed from corruption
      n = n.replace(/<\/?motion\b/g, (m) => m.replace('motion', 'div'));
      n = n.replace(/\uFFFD/g, '');
      if (n !== c) fs.writeFileSync(p, n, 'utf8');
    }
  }
}

walk(root);
console.log('done');
