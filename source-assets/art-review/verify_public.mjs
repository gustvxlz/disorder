// Compare the published static build with local dist; no browser state is changed.
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative, sep } from 'node:path';

const root = resolve('dist');
const base = new URL('https://gustvxlz.github.io/disorder/');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function list(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  return (await Promise.all(entries.filter(entry => !entry.name.startsWith('.')).map(entry => {
    const path = resolve(folder, entry.name);
    return entry.isDirectory() ? list(path) : [path];
  }))).flat();
}
const files = await list(root);
let failed = 0;
for (let i = 0; i < files.length; i += 4) {
  await Promise.all(files.slice(i, i + 4).map(async path => {
    const name = relative(root, path).split(sep).join('/');
    try {
      const response = await fetch(new URL(name, base), { signal: AbortSignal.timeout(30000) });
      const remote = Buffer.from(await response.arrayBuffer());
      const local = await readFile(path);
      // Git normalizes source JSON line endings on the Linux deployment runner.
      const identical = response.ok && (name.endsWith('.json')
        ? JSON.stringify(JSON.parse(remote)) === JSON.stringify(JSON.parse(local))
        : hash(remote) === hash(local));
      if (!identical) failed++;
      console.log(`${response.status} ${identical ? 'MATCH' : 'DIFFERENT'} ${name}`);
    } catch (error) {
      failed++;
      console.log(`FAILED ${name}: ${error.message}`);
    }
  }));
}
console.log(`${files.length - failed}/${files.length} published files match local production build`);
process.exitCode = failed ? 1 : 0;
