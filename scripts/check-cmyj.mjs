import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const channels = ['cmyj-1.6', 'cmyj-1.7-beta', 'cmyj-1.7', 'cmyj-1.8', 'cmyj-1.9'];
const trees = channels.flatMap(channel => [path.join(root, 'src', channel), path.join(root, 'dist', channel)]);

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(fullPath);
  }
  return files;
}

for (const tree of trees) {
  for (const file of await collect(tree)) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (result.status !== 0) {
      process.stderr.write(`语法检查失败：${file}\n`);
      process.stderr.write(result.stderr || result.stdout || result.error?.stack || String(result.error || '未知错误'));
      process.exit(result.status || 1);
    }
  }
}

const worldEngineTest = spawnSync(process.execPath, [path.join(root, 'scripts', 'test-world-engine.mjs')], {
  cwd: root,
  encoding: 'utf8',
});
if (worldEngineTest.status !== 0) {
  process.stderr.write(worldEngineTest.stderr || worldEngineTest.stdout);
  process.exit(worldEngineTest.status || 1);
}
if (worldEngineTest.stdout) process.stdout.write(worldEngineTest.stdout);

const financeTest = spawnSync(process.execPath, [path.join(root, 'scripts', 'test-finance-1.9.mjs')], { cwd: root, encoding: 'utf8' });
if (financeTest.status !== 0) {
  process.stderr.write(financeTest.stderr || financeTest.stdout);
  process.exit(financeTest.status || 1);
}
if (financeTest.stdout) process.stdout.write(financeTest.stdout);

console.info('残明余烬 1.6、DLC 测试版、1.7、1.8 与 1.9 均通过语法检查，天下演化真实载荷回归通过。');
