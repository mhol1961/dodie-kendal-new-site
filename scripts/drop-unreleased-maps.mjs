// postbuild: public/ is copied into every build, so remove the map images of towns
// that aren't released (the release gate in src/data/areas covers pages, links and
// the sitemap). Preview builds keep all of them.
import { rmSync } from 'node:fs';
import { AREAS, RELEASED } from '../src/data/areas/index.ts';

if (process.env.PUBLIC_SITE_PREVIEW !== '1') {
  for (const a of AREAS) {
    if (RELEASED.includes(a.slug)) continue;
    for (const ext of ['webp', 'png']) rmSync(`dist/client/areas/${a.slug}-map.${ext}`, { force: true });
  }
}
