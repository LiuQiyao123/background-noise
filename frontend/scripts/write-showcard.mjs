import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const content = `import { Link } from 'react-router-dom';
import type { Show } from '../api/types';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  });
}

export function ShowCard({ show }: { show: Show }) {
  return (
    <Link to={\`/shows/\${show.id}\`} className="card">
      <motion className="card-row">
        <motion>
          <strong style={{ fontSize: '1.0625rem' }}>{show.artistName}</strong>
          <p className="repo-meta">
            {formatDate(show.showDate)} · {show.venueName}
            {show.city ? \` · \${show.city}\` : ''}
          </p>
        </motion>
        {show.stats && (
          <span className="tag">{show.stats.publicRepoCount} \u6761\u73b0\u573a</span>
        )}
      </motion>
    </Link>
  );
}
`;

const fixed = content.replace(/<\/?motion\b/g, (m) => m.replace(/motion/g, 'div'));
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/components/ShowCard.tsx');
fs.writeFileSync(out, fixed, 'utf8');
