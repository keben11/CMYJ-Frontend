import { access, copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const channels = ['cmyj-1.6', 'cmyj-1.7-beta', 'cmyj-1.7', 'cmyj-1.8', 'cmyj-1.9'];
const mapAssets = ['world_1634.js', 'world_1634_overview.js', 'world_1634_global_overview.js'];

await Promise.all(channels.map(channel => access(path.join(dist, channel, 'loader', 'index.js'))));
await mkdir(dist, { recursive: true });
const distMapDirectory = path.join(dist, 'assets', 'maps');
await mkdir(distMapDirectory, { recursive: true });
await Promise.all(
  mapAssets.map(fileName =>
    copyFile(path.join(root, 'assets', 'maps', fileName), path.join(distMapDirectory, fileName)),
  ),
);
await writeFile(
  path.join(dist, '_headers'),
  channels
    .map(
      channel => `/${channel}/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
`,
    )
    .join('\n'),
  'utf8',
);

console.info(`Cloudflare Pages 响应头与 ${mapAssets.length} 个地图资产已写入 dist。`);
