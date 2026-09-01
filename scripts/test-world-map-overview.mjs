import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import polygonClipping from 'polygon-clipping';

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

function geometryToMultiPolygon(geometry) {
  if (geometry?.type === 'Polygon') return [geometry.coordinates];
  if (geometry?.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function featureBounds(feature) {
  return geometryBounds([feature]);
}

function boundsIntersect(left, right) {
  return (
    left.minLon <= right.maxLon &&
    left.maxLon >= right.minLon &&
    left.minLat <= right.maxLat &&
    left.maxLat >= right.minLat
  );
}

function ringArea(ring) {
  let area = 0;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    area += ring[previous][0] * ring[index][1] - ring[index][0] * ring[previous][1];
  }
  return Math.abs(area) / 2;
}

function multiPolygonArea(coordinates) {
  return coordinates.reduce(
    (total, polygon) =>
      total + ringArea(polygon[0]) - polygon.slice(1).reduce((holes, ring) => holes + ringArea(ring), 0),
    0,
  );
}

function assertNoCrossLayerOverlap(features) {
  const priorities = { fallback_1650: 0, project_1634_gap: 1, exact_1634: 2, project_1634_priority: 3 };
  const indexed = features.map(feature => ({
    feature,
    priority: priorities[feature.properties?.cartographic_layer],
    bounds: featureBounds(feature),
    coordinates: geometryToMultiPolygon(feature.geometry),
  }));
  for (let leftIndex = 0; leftIndex < indexed.length; leftIndex += 1) {
    const left = indexed[leftIndex];
    assert.notEqual(left.priority, undefined, `未知地图层：${left.feature.properties?.cartographic_layer}`);
    for (let rightIndex = leftIndex + 1; rightIndex < indexed.length; rightIndex += 1) {
      const right = indexed[rightIndex];
      if (left.priority === right.priority || !boundsIntersect(left.bounds, right.bounds)) continue;
      const overlap = polygonClipping.intersection(left.coordinates, right.coordinates);
      assert.ok(
        multiPolygonArea(overlap) < 1e-5,
        `${left.feature.properties?.display_name} 与 ${right.feature.properties?.display_name} 仍有跨层重叠`,
      );
    }
  }
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
assert.equal(globalMap.metadata?.clipping_strategy, 'polygon_difference_by_cartographic_priority');
assert.equal(dynamicFeatures.length, regionalMap.features.length);
assert.equal(globalMap.metadata?.source_fallback_coverage_features, 347);
assert.ok(fallbackFeatures.length > 300 && fallbackFeatures.length < 347, '全球覆盖层未按优先级裁剪');
assert.equal(globalMap.metadata?.source_exact_1634_features, 106);
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
assertNoCrossLayerOverlap(globalMap.features);

console.info(
  `World map overview OK: ${fallbackFeatures.length} fallback faces, ${exactFeatures.length} exact 1634 polities, ${dynamicFeatures.length} dynamic regions, bounds ${JSON.stringify(bounds)}.`,
);
