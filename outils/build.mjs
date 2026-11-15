// Minifie le CSS et le JS du site et met à jour les empreintes de cache (?v=) dans les pages HTML.
// Usage : node outils/build.mjs   (Node 18+, télécharge esbuild via npx au premier lancement)
// Le site reste 100 % statique : les fichiers générés (style.min.css, app.min.js) sont versionnés.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const a = (p) => join(root, 'assets', p);
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const esbuild = (args, input) =>
  execFileSync(npx, ['--yes', 'esbuild@0.24.0', ...args], { input, cwd: root, shell: process.platform === 'win32' }).toString();

// CSS
const css = esbuild(['--loader=css', '--minify', '--target=chrome100,firefox100,safari15'], readFileSync(a('style.css')));
writeFileSync(a('style.min.css'), css);

// JS : textes anglais + comportements (config.js reste à part pour rester modifiable à la main)
const js = readFileSync(a('i18n.js'), 'utf8') + '\n;' + readFileSync(a('main.js'), 'utf8');
const min = esbuild(['--loader=js', '--minify', '--target=es2017'], js);
writeFileSync(a('app.min.js'), min);

const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0, 10);
const v = {
  'style.min.css': hash(css),
  'app.min.js': hash(min),
  'config.js': hash(readFileSync(a('config.js'))),
};

for (const page of ['index.html', 'mentions-legales.html', '404.html']) {
  const f = join(root, page);
  let html;
  try { html = readFileSync(f, 'utf8'); } catch { continue; }
  for (const [file, h] of Object.entries(v)) {
    html = html.replace(new RegExp(`(/assets/${file.replace('.', '\\.')})\\?v=[\\w-]+`, 'g'), `$1?v=${h}`);
  }
  writeFileSync(f, html);
}
console.log('OK', v, `css ${css.length} o, js ${min.length} o`);
