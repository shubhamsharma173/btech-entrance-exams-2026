/** Offline tests import the production updater. Live checks are explicit opt-in. */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { main } from './update-exams.mjs';

const args = process.argv.slice(2);
const phaseIndex = args.indexOf('--phase');
const phase = phaseIndex < 0 ? 'all' : args[phaseIndex + 1];
if (!['all', '1', '2', '3'].includes(phase)) {
  console.error('Usage: node scripts/test-update.mjs [--phase 1|2|3] [--live]');
  process.exitCode = 1;
} else if (phase === '2') {
  if (!args.includes('--live')) {
    console.error('Live API checks are disabled by default. Explicitly add --live and provide both API keys to make external calls.');
    process.exitCode = 1;
  } else {
    process.exitCode = await main(['--dry-run', '--exam', 'BITSAT']);
  }
} else {
  const pattern = phase === '1' ? '^(core|transport):' : phase === '3' ? '^integration:' : null;
  const testFile = fileURLToPath(new URL('../tests/updater.test.mjs', import.meta.url));
  const child = spawnSync(process.execPath, ['--test', ...(pattern ? [`--test-name-pattern=${pattern}`] : []), testFile], { stdio: 'inherit', timeout: 60000 });
  if (child.error) console.error(child.error.message);
  process.exitCode = child.status ?? 1;
}
