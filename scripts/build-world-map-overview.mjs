import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

// These 1650 baseline faces are replaced by the repository's more detailed 1634 reconstruction.
const SUPERSEDED_WORLD_BASE_NAMES = new Set(['Korea', 'Tokugawa Shogunate', 'Ainu']);

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

const [detailedSource, regionalSource, cliopatriaSource] = await Promise.all([
  readFile(detailedMapPath, 'utf8'),
  readFile(regionalOverviewPath, 'utf8'),
  readFile(cliopatriaSnapshotPath, 'utf8'),
]);
const detailedMap = parseWrappedMap(detailedSource, WORLD_PREFIX, detailedMapPath);
const regionalOverview = parseWrappedMap(regionalSource, REGIONAL_PREFIX, regionalOverviewPath);
const cliopatriaSnapshot = parseWrappedMap(cliopatriaSource, CLIOPATRIA_PREFIX, cliopatriaSnapshotPath);

const worldBaseFeatures = detailedMap.features
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
        dynamic: false,
      },
    };
  });

// Cliopatria 提供直接覆盖 1634 年的政权面。它们绘制在 1650 宏观覆盖层之上，
// 修正英伦、俄罗斯、神圣罗马帝国、波斯、印度等在 1634 年已经不同的边界。
const exact1634Features = cliopatriaSnapshot.features.map((feature, index) => {
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
    dynamic: true,
  },
}));

const globalOverview = {
  type: 'FeatureCollection',
  name: 'world_1634_global_overview',
  year: 1634,
  metadata: {
    reference_year: 1634,
    scope: 'global',
    dynamic_scope: 'All features expose stable region_key values for lazy MVU records',
    initial_dynamic_scope: 'East, Southeast and South Asia plus Australia',
    detailed_region_source: 'world_1634_overview.js',
    detailed_region_geometry_year: 1634,
    exact_snapshot_source: cliopatriaSnapshot.metadata?.source || 'Seshat Global History Databank / Cliopatria',
    exact_snapshot_source_url: cliopatriaSnapshot.metadata?.source_url,
    exact_snapshot_license: cliopatriaSnapshot.metadata?.license || 'CC BY 4.0',
    fallback_coverage_source:
      detailedMap.metadata?.world_base_source || 'aourednik/historical-basemaps world_1650.geojson',
    fallback_coverage_year: detailedMap.metadata?.world_base_year || 1650,
    accuracy_note:
      'Cliopatria leaf-polity geometry supplies the exact 1634 temporal snapshot. The 1650 macro layer is retained only as cartographic coverage where the exact dataset has no polity, and the project 1634 East Asian reconstruction has final display priority.',
    fallback_coverage_features: worldBaseFeatures.length,
    exact_1634_features: exact1634Features.length,
    dynamic_region_features: dynamicRegionFeatures.length,
  },
  features: [...worldBaseFeatures, ...exact1634Features, ...dynamicRegionFeatures],
};

await writeFile(globalOverviewPath, `${GLOBAL_PREFIX}${JSON.stringify(globalOverview)};\n`, 'utf8');
console.info(
  `Built ${path.relative(root, globalOverviewPath)} with ${worldBaseFeatures.length} fallback faces, ${exact1634Features.length} exact 1634 polities and ${dynamicRegionFeatures.length} dynamic 1634 regions.`,
);
