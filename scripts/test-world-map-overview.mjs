import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const globalPath = path.join(root, 'assets', 'maps', 'world_1634_global_overview.js');
const regionalPath = path.join(root, 'assets', 'maps', 'world_1634_overview.js');

function parseWrappedMap(source, prefix, sourcePath) {
  assert.ok(source.startsWith(prefix), `Unexpected map wrapper in ${sourcePath}`);
  return JSON.parse(source.slice(prefix.length).trim().replace(/;$/, ''));
}

function geometryBounds(features) {
  const bounds = { minLon: Infinity, minLat: Infinity, maxLon: -Infinity, maxLat: -Infinity };
  const visit = value => {
    if (!Array.isArray(value)) return;
    if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
      bounds.minLon = Math.min(bounds.minLon, value[0]);
      bounds.maxLon = Math.max(bounds.maxLon, value[0]);
      bounds.minLat = Math.min(bounds.minLat, value[1]);
      bounds.maxLat = Math.max(bounds.maxLat, value[1]);
      return;
    }
    value.forEach(visit);
  };
  features.forEach(feature => visit(feature.geometry?.coordinates));
  return bounds;
}

const [globalSource, regionalSource] = await Promise.all([
  readFile(globalPath, 'utf8'),
  readFile(regionalPath, 'utf8'),
]);
const globalMap = parseWrappedMap(globalSource, 'var WORLD_1634_GLOBAL_OVERVIEW=', globalPath);
const regionalMap = parseWrappedMap(regionalSource, 'var WORLD_1634_OVERVIEW=', regionalPath);
const dynamicFeatures = globalMap.features.filter(feature => feature.properties?.dynamic === true);
const exactFeatures = globalMap.features.filter(
  feature => feature.properties?.historical_accuracy === 'exact_temporal_snapshot',
);
const fallbackFeatures = globalMap.features.filter(
  feature => feature.properties?.historical_accuracy === 'fallback_coverage_only',
);
const bounds = geometryBounds(globalMap.features);

assert.equal(globalMap.year, 1634);
assert.equal(globalMap.metadata?.reference_year, 1634);
assert.equal(globalMap.metadata?.fallback_coverage_year, 1650);
assert.equal(dynamicFeatures.length, regionalMap.features.length);
assert.ok(fallbackFeatures.length > 300, '全球覆盖层特征数量异常');
assert.equal(exactFeatures.length, 106, 'Cliopatria 1634 精确政权数量异常');
assert.ok(bounds.minLon < -170 && bounds.maxLon > 170, '全球底图未覆盖东西半球');
assert.ok(bounds.minLat < -75 && bounds.maxLat > 70, '全球底图未覆盖主要南北纬度');
assert.equal(new Set(globalMap.features.map(feature => feature.properties?.name)).size, globalMap.features.length);
assert.ok(
  globalMap.features.every(feature => feature.properties?.display_name),
  '全球底图存在空显示名',
);
assert.ok(
  globalMap.features.every(feature => feature.properties?.region_key),
  '全球底图存在空 MVU 地区键',
);
assert.ok(
  globalMap.features.every(feature => !/[A-Za-z]/.test(feature.properties?.display_name)),
  '地图仍存在英文显示名',
);
assert.ok(dynamicFeatures.every(feature => feature.properties?.reference_year === 1634));
assert.ok(dynamicFeatures.some(feature => feature.properties?.name === '北直隶'));
assert.ok(exactFeatures.some(feature => feature.properties?.display_name === '英格兰王国'));
assert.ok(exactFeatures.some(feature => feature.properties?.display_name === '神圣罗马帝国诸邦'));
assert.ok(exactFeatures.some(feature => feature.properties?.display_name === '俄罗斯沙皇国'));
assert.ok(exactFeatures.some(feature => feature.properties?.display_name === '后金'));
assert.ok(exactFeatures.some(feature => feature.properties?.display_name === '托斯卡纳大公国'));
assert.ok(
  exactFeatures.every(feature => feature.properties?.source_name !== 'Golden Horde'),
  '仍包含错置的金帐汗国面',
);
assert.ok(
  fallbackFeatures.every(feature => !['Korea', 'Tokugawa Shogunate', 'Ainu'].includes(feature.properties?.source_name)),
  '全球底图仍包含被 1634 东亚细图覆盖的重复面',
);

console.info(
  `World map overview OK: ${fallbackFeatures.length} fallback faces, ${exactFeatures.length} exact 1634 polities, ${dynamicFeatures.length} dynamic regions, bounds ${JSON.stringify(bounds)}.`,
);
