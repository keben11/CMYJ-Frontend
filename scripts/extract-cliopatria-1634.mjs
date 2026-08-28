import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = process.argv[2];
const outputPath = path.join(root, 'assets', 'maps', 'cliopatria_1634_snapshot.js');
const targetYear = 1634;
const excludedNames = new Set([
  // 上游 1632—1635 切片中的明显错置：金帐汗国已于 1502 年灭亡，且该面实际落在蒙古高原；
  // 乌赫尔伯国已于 1413 年并入阿拉贡；“马六甲苏丹国”大面同时覆盖多处已由细图接管的岛屿。
  'Golden Horde',
  'County of Urgell',
  'Sultanate of Malacca',
]);
const correctedNames = new Map([
  ['Republic of Florence', 'Grand Duchy of Tuscany'],
  ['First Toungoo Empire', 'Restored Toungoo Dynasty'],
  ['Khmer Empire', 'Kingdom of Cambodia'],
]);

if (!inputPath) {
  throw new Error('用法：node scripts/extract-cliopatria-1634.mjs <cliopatria_polities_only.geojson>');
}

const source = JSON.parse(await readFile(path.resolve(inputPath), 'utf8'));
const features = source.features
  .filter(
    feature => Number(feature?.properties?.FromYear) <= targetYear && Number(feature?.properties?.ToYear) >= targetYear,
  )
  // 带 Components 的条目是其下属政权的重复聚合面；地图只保留叶级政权，避免双重描边。
  .filter(feature => !String(feature?.properties?.Components || '').trim())
  .filter(feature => !excludedNames.has(feature.properties.Name))
  .map(feature => ({
    type: 'Feature',
    properties: {
      name: correctedNames.get(feature.properties.Name) || feature.properties.Name,
      source_name: feature.properties.Name,
      from_year: Number(feature.properties.FromYear),
      to_year: Number(feature.properties.ToYear),
      area_km2: Number(feature.properties.Area),
      wikipedia: feature.properties.Wikipedia || '',
      wikidata: feature.properties.Wikidata || '',
      seshat_id: feature.properties.SeshatID || '',
      member_of: feature.properties.MemberOf || '',
    },
    geometry: feature.geometry,
  }));

const snapshot = {
  type: 'FeatureCollection',
  name: 'cliopatria_1634_snapshot',
  year: targetYear,
  metadata: {
    source: 'Seshat Global History Databank / Cliopatria v0.2.0',
    source_url: 'https://github.com/Seshat-Global-History-Databank/cliopatria',
    license: 'CC BY 4.0',
    selection: 'FromYear <= 1634 <= ToYear; leaf polity records only; documented anachronisms excluded or renamed',
    modified: true,
  },
  features,
};

await writeFile(outputPath, `var CLIOPATRIA_1634_SNAPSHOT=${JSON.stringify(snapshot)};\n`, 'utf8');
console.info(`写入 ${path.relative(root, outputPath)}：${features.length} 个 1634 年叶级政权。`);
