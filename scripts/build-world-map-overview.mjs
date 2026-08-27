import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const detailedMapPath = path.join(root, 'assets', 'maps', 'world_1634.js');
const regionalOverviewPath = path.join(root, 'assets', 'maps', 'world_1634_overview.js');
const globalOverviewPath = path.join(root, 'assets', 'maps', 'world_1634_global_overview.js');

const WORLD_PREFIX = 'var WORLD_1634=';
const REGIONAL_PREFIX = 'var WORLD_1634_OVERVIEW=';
const GLOBAL_PREFIX = 'var WORLD_1634_GLOBAL_OVERVIEW=';

// These 1650 baseline faces are replaced by the repository's more detailed 1634 reconstruction.
const SUPERSEDED_WORLD_BASE_NAMES = new Set(['Korea', 'Tokugawa Shogunate', 'Ainu']);

// Keep the source polity name for auditability while presenting the most visible world powers in Chinese.
const WORLD_POLITY_NAME_ZH = {
  'Ottoman Empire': '奥斯曼帝国',
  'Safavid Empire': '萨法维帝国',
  'Tsardom of Muscovy': '俄罗斯沙皇国',
  'Polish-Lithuanian Commonwealth': '波兰—立陶宛联邦',
  'Spanish Habsburg': '西班牙哈布斯堡',
  Spain: '西班牙',
  Portugal: '葡萄牙',
  France: '法兰西王国',
  England: '英格兰王国',
  Scotland: '苏格兰王国',
  'Dutch Republic': '尼德兰联省共和国',
  Denmark: '丹麦—挪威',
  Sweden: '瑞典王国',
  'Holy Roman Empire': '神圣罗马帝国',
  'Papal States': '教皇国',
  Venice: '威尼斯共和国',
  'Vice-Royalty of New Spain': '新西班牙总督辖区',
  'Vice-Royalty of Peru': '秘鲁总督辖区',
  'Quazaq Khanate': '哈萨克汗国',
  'Khiva Khanate': '希瓦汗国',
  'Nogai Horde': '诺盖汗国',
  'central Asian khanates': '中亚诸汗国',
  Oman: '阿曼',
  Ethiopia: '埃塞俄比亚帝国',
  'Hausa States': '豪萨诸邦',
  Morocco: '摩洛哥',
  Madagascar: '马达加斯加诸国',
  Maori: '毛利诸部',
  Papous: '巴布亚诸部',
  'Tuʻi Tonga Empire': '汤加帝国',
};

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

function displayNameForWorldFeature(feature) {
  const properties = feature?.properties || {};
  const sourceName = String(properties.name || properties.NAME || '').trim();
  if (!sourceName || sourceName === 'NaN') return '未定区域';
  return WORLD_POLITY_NAME_ZH[sourceName] || sourceName;
}

const [detailedSource, regionalSource] = await Promise.all([
  readFile(detailedMapPath, 'utf8'),
  readFile(regionalOverviewPath, 'utf8'),
]);
const detailedMap = parseWrappedMap(detailedSource, WORLD_PREFIX, detailedMapPath);
const regionalOverview = parseWrappedMap(regionalSource, REGIONAL_PREFIX, regionalOverviewPath);

const worldBaseFeatures = detailedMap.features
  .filter(feature => feature?.properties?.category === 'world_base')
  .filter(feature => !SUPERSEDED_WORLD_BASE_NAMES.has(feature.properties.name))
  .map((feature, index) => {
    const sourceName = String(feature.properties.name || feature.properties.NAME || '').trim();
    return {
      ...feature,
      properties: {
        ...feature.properties,
        name: `world-base:${index}`,
        source_name: sourceName,
        display_name: displayNameForWorldFeature(feature),
        reference_year: 1634,
        dynamic: false,
      },
    };
  });

const dynamicRegionFeatures = regionalOverview.features.map(feature => ({
  ...feature,
  properties: {
    ...feature.properties,
    display_name: feature.properties.name,
    reference_year: 1634,
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
    dynamic_scope: 'East, Southeast and South Asia plus Australia',
    detailed_region_source: 'world_1634_overview.js',
    global_baseline_source: detailedMap.metadata?.world_base_source || 'aourednik/historical-basemaps world_1650.geojson',
    global_baseline_year: detailedMap.metadata?.world_base_year || 1650,
    accuracy_note:
      'The 1634 East Asian reconstruction is authoritative for interactive regions; the rest of the world uses the nearest available 1650 macro-boundary baseline as a non-dynamic geographic overview.',
    world_base_features: worldBaseFeatures.length,
    dynamic_region_features: dynamicRegionFeatures.length,
  },
  features: [...worldBaseFeatures, ...dynamicRegionFeatures],
};

await writeFile(globalOverviewPath, `${GLOBAL_PREFIX}${JSON.stringify(globalOverview)};\n`, 'utf8');
console.info(
  `Built ${path.relative(root, globalOverviewPath)} with ${worldBaseFeatures.length} global baseline faces and ${dynamicRegionFeatures.length} dynamic 1634 regions.`,
);
