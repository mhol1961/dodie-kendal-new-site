// postbuild: public/ is copied into every build, so remove the map and hero images of towns
// that aren't released (the release gate in src/data/areas covers pages, links and
// the sitemap). Preview builds keep all of them.
import { readdirSync, rmSync } from 'node:fs';
import { AREAS, RELEASED } from '../src/data/areas/index.ts';

if (process.env.PUBLIC_SITE_PREVIEW !== '1') {
  for (const a of AREAS) {
    if (RELEASED.includes(a.slug)) continue;
    for (const f of readdirSync('dist/client/areas')) {
      if (f.startsWith(`${a.slug}-map`) || f.startsWith(`${a.slug}-hero-`)) rmSync(`dist/client/areas/${f}`);
    }
  }
}
