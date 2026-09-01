import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import polygonClipping from 'polygon-clipping';
import { historicalPolityNameZh } from './map-polity-names-zh.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const detailedMapPath = path.join(root, 'assets', 'maps', 'world_1634.js');
const regionalOverviewPath = path.join(root, 'assets', 'maps', 'world_1634_overview.js');
const cliopatriaSnapshotPath = path.join(root, 'assets', 'maps', 'cliopatria_1634_snapshot.js');
const globalOverviewPath = path.join(root, 'assets', 'maps', 'world_1634_global_overview.js');

const WORLD_PREFIX = 'var WORLD_1634=';
const REGIONAL_PREFIX = 'var WORLD_1634_OVERVIEW=';
const CLIOPATRIA_PREFIX = 'var CLIOPATRIA_1634_SNAPSHOT=';
const GLOBAL_PREFIX = 'var WORLD_1634_GLOBAL_OVERVIEW=';
const REGIONAL_MACRO_COVERAGE_THRESHOLD = 0.9;

// These 1650 baseline faces are replaced by the repository's more detailed 1634 reconstruction.
const SUPERSEDED_WORLD_BASE_NAMES = new Set(['Korea', 'Tokugawa Shogunate', 'Ainu']);
const PROJECT_PRIORITY_REGION_NAMES = new Set([
  '东番',
  '乌思藏',
  '云南',
  '北直隶',
  '南直隶',
  '后金',
  '四川',
  '宁夏',
  '察哈尔',
  '山东',
  '山西',
  '广东',
  '广西',
  '日本',
  '朝鲜',
  '江西',
  '河南',
  '浙江',
  '湖广',
  '福建',
  '西域',
  '贵州',
  '辽东',
  '陕西',
  '青海',
]);

function parseWrappedMap(source, prefix, sourcePath) {
  if (!source.startsWith(prefix)) throw new Error(`Unexpected map wrapper in ${sourcePath}`);
  // The historical source preserves a few shapefile NaN values as JavaScript literals.
  // Normalize only value-position NaN tokens; never evaluate the asset as code.
  const json = source
    .slice(prefix.length)
    .trim()
    .replace(/;$/, '')
    .replace(/:\s*NaN(?=\s*[,}])/g, ':null');
  return JSON.parse(json);
}

function geometryToMultiPolygon(geometry) {
  if (geometry?.type === 'Polygon') return [geometry.coordinates];
  if (geometry?.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function multiPolygonToGeometry(coordinates) {
  if (!coordinates.length) return null;
  return coordinates.length === 1
    ? { type: 'Polygon', coordinates: coordinates[0] }
    : { type: 'MultiPolygon', coordinates };
}

function multiPolygonBounds(coordinates) {
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  for (const polygon of coordinates) {
    for (const ring of polygon) {
      for (const [longitude, latitude] of ring) {
        bounds[0] = Math.min(bounds[0], longitude);
        bounds[1] = Math.min(bounds[1], latitude);
        bounds[2] = Math.max(bounds[2], longitude);
        bounds[3] = Math.max(bounds[3], latitude);
      }
    }
  }
  return bounds;
}

function boundsIntersect(left, right) {
  return left[0] <= right[2] && left[2] >= right[0] && left[1] <= right[3] && left[3] >= right[1];
}

function ringArea(ring) {
  let area = 0;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    area += ring[previous][0] * ring[index][1] - ring[index][0] * ring[previous][1];
  }
  return Math.abs(area) / 2;
}

function featureArea(feature) {
  return geometryToMultiPolygon(feature.geometry).reduce(
    (total, polygon) =>
      total + ringArea(polygon[0]) - polygon.slice(1).reduce((holes, ring) => holes + ringArea(ring), 0),
    0,
  );
}

function deduplicateWholeFeatures(features, preferredFeatures = []) {
  const accepted = preferredFeatures.map(feature => ({
    feature,
    area: featureArea(feature),
    bounds: multiPolygonBounds(geometryToMultiPolygon(feature.geometry)),
    coordinates: geometryToMultiPolygon(feature.geometry),
  }));
  const output = [];
  const duplicateIouThreshold = 0.45;
  const ordered = features.map((feature, index) => ({ feature, index, area: featureArea(feature) }));
  for (const item of ordered) {
    const coordinates = geometryToMultiPolygon(item.feature.geometry);
    const bounds = multiPolygonBounds(coordinates);
    const duplicate = accepted.some(existing => {
      if (!boundsIntersect(bounds, existing.bounds)) return false;
      const overlapArea = featureArea({
        geometry: multiPolygonToGeometry(polygonClipping.intersection(coordinates, existing.coordinates)),
      });
      const unionArea = item.area + existing.area - overlapArea;
      return unionArea > 0 && overlapArea / unionArea >= duplicateIouThreshold;
    });
    if (duplicate) continue;
    output.push(item.feature);
    accepted.push({ feature: item.feature, area: item.area, bounds, coordinates });
  }
  return output;
}

function coveredRatio(feature, coveringFeatures) {
  const coordinates = geometryToMultiPolygon(feature.geometry);
  const bounds = multiPolygonBounds(coordinates);
  let coveredArea = 0;
  for (const cover of coveringFeatures) {
    const coverCoordinates = geometryToMultiPolygon(cover.geometry);
    if (!boundsIntersect(bounds, multiPolygonBounds(coverCoordinates))) continue;
    const intersection = polygonClipping.intersection(coordinates, coverCoordinates);
    if (intersection.length) coveredArea += featureArea({ geometry: multiPolygonToGeometry(intersection) });
  }
  return Math.min(coveredArea / featureArea(feature), 1);
}

const [detailedSource, regionalSource, cliopatriaSource] = await Promise.all([
  readFile(detailedMapPath, 'utf8'),
  readFile(regionalOverviewPath, 'utf8'),
  readFile(cliopatriaSnapshotPath, 'utf8'),
]);
const detailedMap = parseWrappedMap(detailedSource, WORLD_PREFIX, detailedMapPath);
const regionalOverview = parseWrappedMap(regionalSource, REGIONAL_PREFIX, regionalOverviewPath);
const cliopatriaSnapshot = parseWrappedMap(cliopatriaSource, CLIOPATRIA_PREFIX, cliopatriaSnapshotPath);

const rawWorldBaseFeatures = detailedMap.features
  .filter(feature => feature?.properties?.category === 'world_base')
  .filter(feature => !SUPERSEDED_WORLD_BASE_NAMES.has(feature.properties.name))
  .map((feature, index) => {
    const sourceName = String(feature.properties.name || feature.properties.NAME || '').trim();
    const displayName = historicalPolityNameZh(sourceName, index);
    return {
      ...feature,
      properties: {
        ...feature.properties,
        name: `world-base:${index}`,
        source_name: sourceName,
        display_name: displayName,
        region_key: displayName,
        reference_year: 1634,
        geometry_reference_year: 1650,
        historical_accuracy: 'fallback_coverage_only',
        cartographic_layer: 'fallback_1650',
        dynamic: false,
      },
    };
  });

// Cliopatria 提供直接覆盖 1634 年的政权面。它们绘制在 1650 宏观覆盖层之上，
// 修正英伦、俄罗斯、神圣罗马帝国、波斯、印度等在 1634 年已经不同的边界。
const rawExact1634Features = cliopatriaSnapshot.features.map((feature, index) => {
  const sourceName = String(feature.properties?.name || '').trim();
  const displayName = historicalPolityNameZh(sourceName, index);
  return {
    ...feature,
    properties: {
      ...feature.properties,
      name: `cliopatria-1634:${index}`,
      source_name: sourceName,
      display_name: displayName,
      region_key: displayName,
      reference_year: 1634,
      geometry_reference_year: 1634,
      historical_accuracy: 'exact_temporal_snapshot',
      cartographic_layer: 'exact_1634',
      geometry_source: 'Seshat Global History Databank / Cliopatria v0.2.0',
      dynamic: false,
    },
  };
});

const dynamicRegionFeatures = regionalOverview.features.map(feature => ({
  ...feature,
  properties: {
    ...feature.properties,
    display_name: feature.properties.name,
    region_key: feature.properties.name,
    reference_year: 1634,
    geometry_reference_year: 1634,
    historical_accuracy: 'project_1634_regional_reconstruction',
    cartographic_layer: PROJECT_PRIORITY_REGION_NAMES.has(feature.properties.name)
      ? 'project_1634_priority'
      : 'project_1634_gap',
    dynamic: true,
  },
}));

// Keep the complete fallback coverage intact. Matching exact faces are removed whole,
// rather than deleting a broader fallback face and exposing uncovered territory.
const exact1634Candidates = deduplicateWholeFeatures(rawExact1634Features, rawWorldBaseFeatures);
const macroFeatures = [...rawWorldBaseFeatures, ...exact1634Candidates];
const macroCoverage = macroFeatures.map(feature => ({ feature, ratio: coveredRatio(feature, dynamicRegionFeatures) }));
if (process.env.CMYJ_MAP_DEBUG_COVERAGE) {
  console.info(
    macroCoverage
      .filter(item => item.ratio > 0.1)
      .sort((left, right) => right.ratio - left.ratio)
      .map(item => `${item.feature.properties.display_name}: ${item.ratio.toFixed(4)}`)
      .join('\n'),
  );
}
const retainedMacroFeatures = macroCoverage
  .filter(item => item.ratio < REGIONAL_MACRO_COVERAGE_THRESHOLD)
  .map(item => item.feature);
const worldBaseFeatures = retainedMacroFeatures.filter(
  feature => feature.properties.cartographic_layer === 'fallback_1650',
);
const exact1634Features = retainedMacroFeatures.filter(
  feature => feature.properties.cartographic_layer === 'exact_1634',
);

const globalOverview = {
  type: 'FeatureCollection',
  name: 'world_1634_global_overview',
  year: 1634,
  metadata: {
    reference_year: 1634,
    scope: 'global',
    dynamic_scope: 'All features expose stable region_key values for lazy MVU records',
    world_scope_detail_policy: 'complete_fallback_plus_regional_detail',
    detailed_region_source: 'world_1634_overview.js',
    detailed_region_geometry_year: 1634,
    exact_snapshot_source: cliopatriaSnapshot.metadata?.source || 'Seshat Global History Databank / Cliopatria',
    exact_snapshot_source_url: cliopatriaSnapshot.metadata?.source_url,
    exact_snapshot_license: cliopatriaSnapshot.metadata?.license || 'CC BY 4.0',
    fallback_coverage_source:
      detailedMap.metadata?.world_base_source || 'aourednik/historical-basemaps world_1650.geojson',
    fallback_coverage_year: detailedMap.metadata?.world_base_year || 1650,
    accuracy_note:
      'The complete fallback layer is retained to prevent holes. Duplicate exact faces and macro faces fully covered by regional detail are removed whole; no geometry is clipped.',
    clipping_strategy: 'whole_feature_deduplication_coverage_first',
    duplicate_iou_threshold: 0.45,
    regional_macro_coverage_threshold: REGIONAL_MACRO_COVERAGE_THRESHOLD,
    source_fallback_coverage_features: rawWorldBaseFeatures.length,
    fallback_coverage_features: worldBaseFeatures.length,
    source_exact_1634_features: rawExact1634Features.length,
    exact_1634_features: exact1634Features.length,
    source_regional_detail_features: regionalOverview.features.length,
    dynamic_region_features: dynamicRegionFeatures.length,
  },
  features: [...worldBaseFeatures, ...exact1634Features, ...dynamicRegionFeatures],
};

await writeFile(globalOverviewPath, `${GLOBAL_PREFIX}${JSON.stringify(globalOverview)};\n`, 'utf8');
console.info(
  `Built ${path.relative(root, globalOverviewPath)} with ${worldBaseFeatures.length} fallback faces, ${exact1634Features.length} exact 1634 polities and ${dynamicRegionFeatures.length} regional faces without clipped geometry.`,
);
