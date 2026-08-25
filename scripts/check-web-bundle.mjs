import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const html = await readFile('dist/index.html', 'utf8');
const match = html.match(/<script[^>]+src=["']([^"']+\.js)["']/i);
if (!match) throw new Error('dist/index.html does not reference a generated JavaScript bundle');
const files = await readdir('dist/_expo/static/js/web');
const bundles = files.filter((file) => file.endsWith('.js'));
if (!bundles.length) throw new Error('No generated web JavaScript bundle found');
const forbidden = ['expo-sqlite', 'wa-sqlite', 'ExpoSQLite', 'kv-store', 'openDatabaseSync'];
for (const file of bundles) {
  const source = await readFile(join('dist/_expo/static/js/web', file), 'utf8');
  for (const marker of forbidden) if (source.includes(marker)) throw new Error(`${marker} found in ${file}`);
}
console.log(`Web bundle guard passed for ${match[1]} (${bundles.length} bundle).`);
