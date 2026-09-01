import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const loaderPath = path.join(root, 'dist', 'cmyj-1.6', 'loader', 'index.js');
const loader = await readFile(loaderPath, 'utf8');
const loaderSource = await readFile(path.join(root, 'src', 'cmyj-1.6', 'loader', 'index.js'), 'utf8');
const workshopSource = await readFile(path.join(root, 'src', 'cmyj-1.6', 'workshop', 'index.js'), 'utf8');
const statusbarSource = await readFile(path.join(root, 'src', 'cmyj-1.6', 'statusbar', 'index.js'), 'utf8');
const schemaSource = await readFile(path.join(root, 'src', 'cmyj-1.6', 'schema', 'index.js'), 'utf8');
const betaLoader = await readFile(path.join(root, 'dist', 'cmyj-1.7-beta', 'loader', 'index.js'), 'utf8');
const betaWorkshopSource = await readFile(path.join(root, 'src', 'cmyj-1.7-beta', 'workshop', 'index.js'), 'utf8');
const betaStatusbarSource = await readFile(path.join(root, 'src', 'cmyj-1.7-beta', 'statusbar', 'index.js'), 'utf8');
const betaScenarioSource = await readFile(
  path.join(root, 'src', 'cmyj-1.7-beta', 'scenario-generator', 'index.js'),
  'utf8',
);
const releaseLoader = await readFile(path.join(root, 'dist', 'cmyj-1.7', 'loader', 'index.js'), 'utf8');
const releaseLoaderSource = await readFile(path.join(root, 'src', 'cmyj-1.7', 'loader', 'index.js'), 'utf8');
const releaseWorkshopSource = await readFile(path.join(root, 'src', 'cmyj-1.7', 'workshop', 'index.js'), 'utf8');
const releaseStatusbarSource = await readFile(path.join(root, 'src', 'cmyj-1.7', 'statusbar', 'index.js'), 'utf8');
const releaseMapOverviewSource = await readFile(path.join(root, 'assets', 'maps', 'world_1634_overview.js'), 'utf8');
const releaseScenarioSource = await readFile(
  path.join(root, 'src', 'cmyj-1.7', 'scenario-generator', 'index.js'),
  'utf8',
);
const releaseGeneratorSource = await readFile(path.join(root, 'src', 'cmyj-1.7', 'generator', 'index.js'), 'utf8');
const releaseWorldEngineSource = await readFile(path.join(root, 'src', 'cmyj-1.7', 'world-engine', 'index.js'), 'utf8');
const releaseCardPackagerSource = await readFile(path.join(root, 'scripts', 'package-release-card.mjs'), 'utf8');
const releaseWorldEngineStyle = await readFile(
  path.join(root, 'src', 'cmyj-1.7', 'world-engine', 'styles-integrated.raw'),
  'utf8',
);
const releaseSchemaSource = await readFile(path.join(root, 'src', 'cmyj-1.7', 'schema', 'definition.js'), 'utf8');
const originalTongchengAdaptations = JSON.parse(
  await readFile(
    path.join(root, 'src', 'cmyj-1.7-beta', 'statusbar', 'original-tongcheng-character-adaptations.json'),
    'utf8',
  ),
);
const originalTongchengProfiles = JSON.parse(
  await readFile(path.join(root, 'src', 'cmyj-1.7', 'statusbar', 'original-tongcheng-character-profiles.json'), 'utf8'),
);
const originalTongchengOverview = JSON.parse(
  await readFile(path.join(root, 'src', 'cmyj-1.7', 'statusbar', 'original-tongcheng-character-overview.json'), 'utf8'),
);
const originalTongchengRelationshipGraph = JSON.parse(
  await readFile(path.join(root, 'src', 'cmyj-1.7', 'statusbar', 'original-tongcheng-relationship-graph.json'), 'utf8'),
);
const v18Loader = await readFile(path.join(root, 'dist', 'cmyj-1.8', 'loader', 'index.js'), 'utf8');
const v18LoaderSource = await readFile(path.join(root, 'src', 'cmyj-1.8', 'loader', 'index.js'), 'utf8');
const v18SchemaSource = await readFile(path.join(root, 'src', 'cmyj-1.8', 'schema', 'definition.js'), 'utf8');
const v18GeneratorSource = await readFile(path.join(root, 'src', 'cmyj-1.8', 'generator', 'index.js'), 'utf8');
const v18ScenarioSource = await readFile(path.join(root, 'src', 'cmyj-1.8', 'scenario-generator', 'index.js'), 'utf8');
const v18StatusbarSource = await readFile(path.join(root, 'src', 'cmyj-1.8', 'statusbar', 'index.js'), 'utf8');
const v18WorkshopSource = await readFile(path.join(root, 'src', 'cmyj-1.8', 'workshop', 'index.js'), 'utf8');
const v18WorldEngineSource = await readFile(path.join(root, 'src', 'cmyj-1.8', 'world-engine', 'index.js'), 'utf8');
const v18ApiCompatSource = await readFile(path.join(root, 'src', 'cmyj-1.8', 'shared', 'api-compat.js'), 'utf8');
const v18CharacterAdaptationSource = await readFile(
  path.join(root, 'src', 'cmyj-1.8', 'shared', 'character-adaptation.js'),
  'utf8',
);
const v18OriginalProfiles = JSON.parse(
  await readFile(path.join(root, 'src', 'cmyj-1.8', 'statusbar', 'original-tongcheng-character-profiles.json'), 'utf8'),
);
const v18OriginalOverview = JSON.parse(
  await readFile(path.join(root, 'src', 'cmyj-1.8', 'statusbar', 'original-tongcheng-character-overview.json'), 'utf8'),
);
const v18OriginalGraph = JSON.parse(
  await readFile(path.join(root, 'src', 'cmyj-1.8', 'statusbar', 'original-tongcheng-relationship-graph.json'), 'utf8'),
);
const v18CharacterCatalogSource = await readFile(
  path.join(root, 'src', 'cmyj-1.8', 'scenario-generator', 'character-catalog.js'),
  'utf8',
);
const v19Loader = await readFile(path.join(root, 'dist', 'cmyj-1.9', 'loader', 'index.js'), 'utf8');
const v19LoaderSource = await readFile(path.join(root, 'src', 'cmyj-1.9', 'loader', 'index.js'), 'utf8');
const v19SchemaSource = await readFile(path.join(root, 'src', 'cmyj-1.9', 'schema', 'definition.js'), 'utf8');
const v19StatusbarSource = await readFile(path.join(root, 'src', 'cmyj-1.9', 'statusbar', 'index.js'), 'utf8');
const v19WorldMapSource = await readFile(path.join(root, 'assets', 'maps', 'world_1634_global_overview.js'), 'utf8');
const v19LegacySource = await readFile(path.join(root, 'src', 'cmyj-1.9', 'legacy', 'index.js'), 'utf8');
const v19ScenarioSource = await readFile(path.join(root, 'src', 'cmyj-1.9', 'scenario-generator', 'index.js'), 'utf8');

assert.ok(loader.length > 300_000, '共享加载器未包含完整脚本集');
assert.match(loader, /CanmingWorkshop/);
assert.match(loader, /CanmingCharacterGenerator/);
assert.match(loader, /CanmingVariableEditor/);
assert.match(loader, /__CMYJRemoteScriptsV2/);
assert.doesNotMatch(loader, /CMYJ-Scripts/);
assert.match(loaderSource, /schema: \(\) => import\('\.\.\/schema\/index\.js'\)/);
assert.doesNotMatch(loaderSource, /^import '\.\.\/statusbar\/index\.js';/m);
assert.match(loaderSource, /await loadRole\(\)/);
assert.match(workshopSource, /canming-workshop-installs/);
assert.match(workshopSource, /data-repair-install/);
assert.match(workshopSource, /repairInstalledWork/);
assert.match(statusbarSource, /worldbookSignatures/);
assert.match(statusbarSource, /STATUSBAR_VERSION = '1\.6\.2'/);
assert.match(statusbarSource, /STATUSBAR_RUNTIME_KEY = '__CMYJStatusbarRuntimeV1'/);
assert.match(statusbarSource, /data\.经济\._自动结算月份 === closeYM/);
assert.match(statusbarSource, /data\.经济\._自动结算月份 = closeYM/);
assert.match(statusbarSource, /trackEventSubscription\(eventOn\(mvu\.events\.VARIABLE_UPDATE_ENDED/);
assert.match(schemaSource, /_自动结算月份: z\.string\(\)\.prefault\(''\)/);
assert.match(workshopSource, /k==='scenario'\?'身份 DLC'/);
assert.match(workshopSource, /身份 DLC 需要《残明余烬》1\.7/);

assert.ok(betaLoader.length > 300_000, 'DLC 测试版共享加载器未包含完整脚本集');
assert.match(betaLoader, /__CMYJRemoteScriptsV17Beta/);
assert.match(betaLoader, /CanmingWorkshop/);
assert.match(betaWorkshopSource, /https:\/\/cm-yj-workshop-staging\.canming-cloud\.workers\.dev/);
assert.doesNotMatch(betaWorkshopSource, /const API='https:\/\/cm-yj-workshop\.canming-cloud\.workers\.dev'/);
assert.match(betaStatusbarSource, /https:\/\/cm-yj-workshop-staging\.canming-cloud\.workers\.dev/);
assert.doesNotMatch(
  betaStatusbarSource,
  /const WORKSHOP_API = 'https:\/\/cm-yj-workshop\.canming-cloud\.workers\.dev'/,
);
assert.match(betaWorkshopSource, /scenario:\['身份 DLC'/);
assert.match(betaWorkshopSource, /canming-workshop-staging:installs-v1/);
assert.match(betaWorkshopSource, /importScenarioPackage/);
assert.match(betaWorkshopSource, /resource\.kind==='scenario'\)await o\.bridge\.importScenarioPackage/);
assert.match(betaWorkshopSource, /IDENTITY INSTALLED/);
assert.match(betaWorkshopSource, /data-scenario-file/);
assert.match(betaWorkshopSource, /scenarioPackageSummary/);
assert.match(betaWorkshopSource, /forgetScenarioInstall/);
assert.match(betaWorkshopSource, /view==='scenarios'/);
assert.match(betaWorkshopSource, /游玩必备/);
assert.match(betaStatusbarSource, /STATUSBAR_VERSION = '1\.7\.0-beta\.13'/);
assert.match(betaWorkshopSource, /DLC 人物志最多包含 60 人/);
assert.match(betaWorkshopSource, /自定义立绘资料为空/);
assert.match(betaScenarioSource, /portraitProfiles: \[\]/);
assert.match(betaStatusbarSource, /const enabled = true/);
assert.match(betaLoader, /CanmingScenarioGenerator/);
assert.match(betaStatusbarSource, /openScenarioGenerator/);
assert.match(betaStatusbarSource, /CanmingStatusbarActions/);
assert.match(betaStatusbarSource, /installOriginalScenario/);
assert.match(betaStatusbarSource, /uninstallCurrentScenario/);
assert.match(betaStatusbarSource, /getInstalledScenarioInfo/);
assert.match(betaStatusbarSource, /worldbookEntryBackups/);
assert.match(betaStatusbarSource, /BUILTIN_TONGCHENG_OPENINGS/);
assert.match(betaStatusbarSource, /class="cm-tools-item">\$\{scenarioGeneratorIcon\(\)\} 开局生成器/);
assert.match(betaStatusbarSource, /scenarioGeneratorRoot\?\.remove\(\)/);
assert.match(betaScenarioSource, /sg-roster-workspace/);
assert.match(betaScenarioSource, /data-character-config/);
assert.match(betaScenarioSource, /setCharacterIncluded/);
assert.match(betaScenarioSource, /sg-choice-box/);
assert.match(betaScenarioSource, /opening\.targetWords/);
assert.match(betaScenarioSource, /selectedReferenceContext/);
assert.match(betaScenarioSource, /data-reference-worldbook-select/);
assert.match(betaScenarioSource, /data-action="open-api-settings"/);
assert.match(betaScenarioSource, /canming-dlc-staging:generator:api/);
assert.match(betaScenarioSource, /\[hidden\]\{display:none!important\}/);
assert.match(betaScenarioSource, /data-scene-summary/);
assert.match(betaScenarioSource, /--radius-shell:20px/);
assert.match(betaScenarioSource, /previousCatalogScroll/);
assert.match(betaScenarioSource, /function protagonistIdentityContent\(\)/);
assert.match(betaScenarioSource, /identityPreviewItem\('公开身份', 'identity'\)/);
assert.match(betaScenarioSource, /写入世界书/);
assert.match(betaScenarioSource, /IDENTITY_ENTRY_NAME = '\[scenario\]<user>身份'/);
assert.match(betaScenarioSource, /function generateProtagonistProfile\(\)/);
assert.match(betaScenarioSource, /data-action="ai-protagonist"/);
assert.match(betaScenarioSource, /protagonist\.identityBoundaries/);
assert.match(betaScenarioSource, /entry\(IDENTITY_ENTRY_NAME, identityContent/);
assert.match(betaStatusbarSource, /staleInstalledWorldbookNames/);
assert.match(betaWorkshopSource, /data-a="scenario-create"/);
assert.match(betaWorkshopSource, /initialBundle/);
assert.match(betaStatusbarSource, /importScenarioWorkshopPackage/);
assert.match(betaStatusbarSource, /writeActiveDlcContext/);
assert.match(betaStatusbarSource, /reloadAfterScenarioInstall/);
assert.match(betaStatusbarSource, /DLC_RELATIONSHIP_GRAPH/);
assert.match(betaStatusbarSource, /CHARACTER_ADAPTATION_PATTERN/);
assert.match(betaStatusbarSource, /applyScenarioCharacterAdaptations/);
assert.match(betaStatusbarSource, /restoreScenarioCharacterAdaptations/);
assert.match(betaStatusbarSource, /resource\.characterAdaptations/);
assert.match(betaStatusbarSource, /resource\.characterOverviews/);
assert.match(betaStatusbarSource, /characterOverviewVersion/);
assert.match(await readFile(path.join(root, 'src', 'cmyj-1.7-beta', 'schema', 'definition.js'), 'utf8'), /_开场标识/);
assert.match(betaStatusbarSource, /身份与关系:/);
assert.match(betaStatusbarSource, /与<user>的过往/);
assert.match(betaStatusbarSource, /角色称呼<user>/);
assert.match(betaStatusbarSource, /与其他人物/);
assert.match(betaStatusbarSource, /演绎要点/);
assert.match(betaStatusbarSource, /getAllPortraitData/);
assert.match(betaStatusbarSource, /SCENARIO_REPLACE_CANCELLED/);
assert.doesNotMatch(betaStatusbarSource, /target: '苏晚棠', label: '母子'/);
assert.equal(originalTongchengAdaptations.length, 19);
for (const adaptation of originalTongchengAdaptations) {
  assert.ok(adaptation.longTermSituation, `${adaptation.character} 缺少原版长期处境`);
  assert.ok(adaptation.adaptationPrinciples?.length >= 3, `${adaptation.character} 缺少关键经历演绎要点`);
  assert.doesNotMatch(JSON.stringify(adaptation), /(?<!<)\buser\b(?!>)/);
}
const experienceAnchors = {
  苏晚棠: '桂花糕',
  苏晚月: '雪夜',
  栖云: '拉住妹妹',
  栖月: '木梳',
  赵砚: '扫院子',
  林知夏: '绝食三日',
  周氏: '像畜生',
  沈大柱: '桌角放糖',
  柳氏: '旧诗集',
  沈清晏: '第一个安字',
  常彪: '铁尺',
  顾明远: '大明律',
  翠儿: '第三碗',
  安娜: '澎湖风浪',
  白瑶: '摁进水缸',
  洪天妹: '田契漏洞',
  陆挽星: '屠庄夜里',
  温素弦: '你要的是人不是尸',
  方子衿: '西洋螺丝刀',
};
for (const [name, anchor] of Object.entries(experienceAnchors)) {
  const adaptation = originalTongchengAdaptations.find(item => item.character === name);
  assert.match(JSON.stringify(adaptation), new RegExp(anchor), `${name} 缺少正式版关键经历「${anchor}」`);
}

assert.ok(releaseLoader.length < 10_000, '1.7 正式版加载器不应重新打包全部功能脚本');
assert.match(releaseLoader, /__CMYJRemoteScriptsV17/);
assert.doesNotMatch(releaseLoader, /__CMYJRemoteScriptsV17Beta/);
assert.match(releaseLoaderSource, /REMOTE_ROOT = 'https:\/\/cmyj-frontend\.pages\.dev\/cmyj-1\.7\/'/);
assert.match(releaseLoaderSource, /realm\[RUNTIME_KEY\] = runtime/);
assert.doesNotMatch(releaseLoaderSource, /^import ['"]\.\.\/(?:schema|legacy|workshop|generator)/m);
assert.match(
  releaseCardPackagerSource,
  /remoteLoaderUrl = 'https:\/\/cmyj-frontend\.pages\.dev\/cmyj-1\.7\/loader\/index\.js'/,
);
assert.doesNotMatch(releaseCardPackagerSource, /remoteLoaderUrl\s*=\s*['"][^'"]+\?v=/);
assert.match(releaseStatusbarSource, /STATUSBAR_VERSION = '1\.9\.0'/);
assert.match(releaseWorkshopSource, /function textCoverMarkup/);
assert.match(releaseWorkshopSource, /class="text-cover tone-/);
assert.match(releaseWorkshopSource, /data-text-cover-image/);
assert.match(releaseWorkshopSource, /function revealTextCover/);
assert.match(releaseScenarioSource, /isOfficialDeepSeekApi\(custom\)/);
assert.match(releaseScenarioSource, /deepSeekJsonSchemaPrompt\(schema\)/);
assert.match(releaseScenarioSource, /usePromptJsonSchema \? \{\} : \{ json_schema: schema \}/);
assert.match(releaseGeneratorSource, /isOfficialDeepSeekApi\(customApi\)/);
assert.match(releaseGeneratorSource, /deepSeekJsonSchemaPrompt\(schema\)/);
assert.match(releaseGeneratorSource, /usePromptJsonSchema \? \{\} : \{ json_schema: schema \}/);
assert.match(releaseGeneratorSource, /customApi \? \{ custom_api: customApi \} : \{\}/);
assert.match(releaseGeneratorSource, /normalizeApiRequestError\(e,/);
assert.match(releaseGeneratorSource, /shouldRetryApiRequest\(e\)/);
assert.match(releaseGeneratorSource, /el\.textContent = state\.error \|\| ''/);
assert.match(releaseScenarioSource, /normalizeApiRequestError\(error,/);
assert.match(releaseScenarioSource, /shouldRetryApiRequest\(error\)/);
assert.match(releaseWorldEngineSource, /jsonSchemaCompatibilityPrompt\(schema\)/);
assert.match(releaseWorldEngineSource, /normalizeModelRequestError\(error,\s*requestDiagnostics\)/);
assert.match(releaseWorldEngineSource, /maxPromptChars:\s*24000/);
assert.match(releaseWorldEngineSource, /maxOutputTokens:\s*8000/);
assert.match(releaseWorldEngineSource, /maxOutputTokens:\s*6000/);
assert.doesNotMatch(releaseWorldEngineSource, /isOfficialDeepSeekApi|shouldFallbackFromJsonSchema/);
assert.match(releaseStatusbarSource, /MAP_ASSET_REVISION = 'd697affd3ed71c09e8278cc2ac37b5d3b5dc2ded'/);
assert.match(releaseStatusbarSource, /assets\/maps\/world_1634\.js/);
assert.match(releaseStatusbarSource, /assets\/maps\/world_1634_overview\.js/);
assert.doesNotMatch(releaseStatusbarSource, /CMYJ-Frontend@main\/assets\/maps/);
assert.equal(originalTongchengProfiles.version, 1);
assert.equal(originalTongchengProfiles.profiles.length, 15);
assert.equal(
  new Set(originalTongchengProfiles.profiles.map(profile => profile.entryName)).size,
  originalTongchengProfiles.profiles.length,
);
for (const profile of originalTongchengProfiles.profiles) {
  assert.ok(profile.entryName.endsWith('_SFW'));
  assert.equal(typeof profile.content, 'string');
  assert.ok(profile.content.length > 1500, `${profile.entryName} 的原版完整人设异常短`);
  assert.match(profile.content, new RegExp(`<${profile.entryName}>`));
  assert.doesNotMatch(profile.content, /CANMING_CHARACTER_ADAPTATION_START/);
}
assert.match(releaseStatusbarSource, /async function applyScenarioCharacterProfiles\(profiles\)/);
assert.match(releaseStatusbarSource, /async function restoreScenarioCharacterProfiles\(backups\)/);
assert.match(releaseStatusbarSource, /characterProfileBackups/);
assert.match(releaseStatusbarSource, /原版完整人设资源不完整/);
assert.match(JSON.stringify(originalTongchengProfiles), /Trébuchet/);
assert.equal(originalTongchengOverview.version, 2);
assert.equal(originalTongchengOverview.entryName, '人物概览');
assert.match(originalTongchengOverview.content, /<原版人物概览>/);
for (const name of ['苏晚棠', '方子衿', '陆挽星', '周皇后', '柳如是', '安娜', '温素弦'])
  assert.match(originalTongchengOverview.content, new RegExp(name), `原版人物概览缺少：${name}`);
assert.equal([...originalTongchengOverview.content.matchAll(/·\s*[^：\n]+：/g)].length, 27);
assert.doesNotMatch(originalTongchengOverview.content, /约?[一二三四五六七八九十]+岁/);
for (const forbidden of [
  '性子',
  '嘴毒',
  '心软',
  '沉默寡言',
  '仗义莽直',
  '性情',
  '精明泼辣',
  '为人憨直',
  '诗才锋利',
  '色艺双绝',
  '剑法高明',
  '冷傲矜贵',
])
  assert.doesNotMatch(originalTongchengOverview.content, new RegExp(forbidden), `人物概览残留性格描述：${forbidden}`);
assert.doesNotMatch(releaseStatusbarSource, /var characterOverviews =/);
assert.match(releaseStatusbarSource, /function hasBuiltinTongchengOverview\(entries\)/);
assert.match(originalTongchengOverview.content, /<原版人物概览>/);
assert.equal(originalTongchengRelationshipGraph.version, 1);
assert.equal(originalTongchengRelationshipGraph.nodes.length, 27);
assert.equal(originalTongchengRelationshipGraph.links.length, 27);
assert.ok(originalTongchengRelationshipGraph.nodes.some(node => node.id === '主角'));
assert.ok(
  originalTongchengRelationshipGraph.links.some(
    link => link.source === '主角' && link.target === '苏晚棠' && link.label === '母子',
  ),
);
assert.doesNotMatch(JSON.stringify(originalTongchengRelationshipGraph.nodes), /约?[一二三四五六七八九十]+岁/);
assert.match(releaseStatusbarSource, /ORIGINAL_TONGCHENG_RELATIONSHIP_GRAPH/);
assert.match(releaseStatusbarSource, /relationshipGraphVersion/);
assert.match(releaseStatusbarSource, /function syncActiveDlcRelationshipGraph\(context = ACTIVE_DLC_CONTEXT\)/);
assert.doesNotMatch(releaseStatusbarSource, /const GRAPH_(?:CATEGORIES|NODES|LINKS)\s*=/);
assert.equal(
  [...releaseStatusbarSource.matchAll(/syncActiveDlcRelationshipGraph\((?:context|null)\)/g)].length,
  3,
  '身份 DLC 安装、修复和卸载必须同步刷新人物谱系',
);
assert.match(JSON.stringify(originalTongchengRelationshipGraph), /未婚夫妻/);
assert.match(releaseStatusbarSource, /east_asia_1634_provinces/);
assert.doesNotMatch(releaseStatusbarSource, /GooYi-C\/History@main\/world_1629\.js/);
const releaseMapOverview = JSON.parse(
  releaseMapOverviewSource.replace(/^var WORLD_1634_OVERVIEW=/, '').replace(/;\s*$/, ''),
);
const releaseMapNames = new Set(releaseMapOverview.features.map(feature => feature.properties.name));
assert.ok(releaseMapNames.has('莫卧儿'), '正式版地图缺少莫卧儿');
const mergedMughal = releaseMapOverview.features.find(feature => feature.properties.name === '莫卧儿');
const mergedSouthIndiaNames = [
  '印度教与伊斯兰诸邦',
  '比达尔苏丹国',
  '比贾布尔苏丹国',
  '艾哈迈德讷格尔苏丹国',
  '戈尔康达苏丹国',
  '维查耶那伽罗残余',
];
assert.equal(mergedMughal.geometry.type, 'Polygon', '莫卧儿与南印度没有融合为单一多边形');
assert.equal(mergedMughal.properties.detail_count, 23, '莫卧儿合并区域的明细数量不正确');
for (const southIndiaName of mergedSouthIndiaNames) {
  assert.ok(!releaseMapNames.has(southIndiaName), `南印度政权仍作为独立概览地区存在：${southIndiaName}`);
  assert.ok(
    mergedMughal.properties.merged_overview_regions.includes(southIndiaName),
    `莫卧儿合并元数据缺少：${southIndiaName}`,
  );
}
assert.ok(releaseMapNames.has('澳洲'), '正式版地图缺少澳洲');
for (const feature of releaseMapOverview.features) {
  const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  assert.ok(
    polygons.every(polygon => polygon.length === 1),
    `${feature.properties.name} 仍有概览伪内环`,
  );
}
assert.match(releaseWorkshopSource, /const API='https:\/\/cm-yj-workshop\.canming-cloud\.workers\.dev'/);
assert.match(releaseWorkshopSource, /TK='canming-workshop:token'/);
assert.match(releaseWorkshopSource, /UK='canming-workshop:user'/);
assert.match(releaseWorkshopSource, /INSTALLS_KEY='canming-workshop:installs-v1'/);
assert.match(releaseStatusbarSource, /WORKSHOP_TOKEN_KEY = 'canming-workshop:token'/);
assert.match(releaseStatusbarSource, /ACTIVE_DLC_STORAGE_PREFIX = 'canming-dlc:active-scenario-v1:'/);
assert.doesNotMatch(releaseStatusbarSource, /FORMAL_WORLDBOOK_NAME/);
assert.match(releaseStatusbarSource, /async function readCurrentPrimaryWorldbook\(\)/);
assert.match(releaseStatusbarSource, /getCharWorldbookNames/);
assert.match(releaseStatusbarSource, /data\.是否处女 === false \? '非处女' : '处女'/);
assert.match(releaseStatusbarSource, /data\.同房次数/);
assert.match(releaseSchemaSource, /是否处女: z\.boolean\(\)\.prefault\(true\)/);
assert.match(releaseSchemaSource, /同房次数: z\.coerce/);
assert.match(releaseSchemaSource, /Math\.max\(0, Math\.trunc\(v\)\)/);
assert.match(releaseScenarioSource, /是否处女: true/);
assert.match(releaseScenarioSource, /同房次数: 0/);
assert.match(releaseStatusbarSource, /const worldbookName = getWorldbookName\(\)/);
assert.match(releaseStatusbarSource, /const binding = getNames\('current'\) \|\| \{\}/);
assert.match(releaseStatusbarSource, /const primary = String\(binding\.primary \|\| ''\)\.trim\(\)/);
assert.doesNotMatch(releaseStatusbarSource, /additional\.push\(binding\.primary\)/);
assert.match(releaseStatusbarSource, /const entries = await readCurrentPrimaryWorldbook\(\)/);
assert.doesNotMatch(releaseStatusbarSource, /rebindCharWorldbooks/);
assert.match(releaseGeneratorSource, /STORAGE_KEY_API = 'canming-gen-api-cfg'/);
assert.match(releaseScenarioSource, /API_SETTINGS_KEY = 'canming-gen-api-cfg'/);
assert.match(releaseScenarioSource, /minBaseVersion: '1\.7\.0'/);
assert.match(releaseWorldEngineSource, /VERSION = '2\.0\.0'/);
assert.match(releaseWorldEngineSource, /function factRoutingSystemPrompt/);
assert.match(releaseWorldEngineSource, /function isolatedSystemPrompt/);
assert.match(releaseWorldEngineSource, /callFactRouter/);
assert.match(releaseWorldEngineSource, /callIsolatedWorldModel/);
assert.match(releaseWorldEngineSource, /<h3>消息流转<\/h3>/);
assert.match(releaseWorldEngineSource, /流转消息 <b>/);
assert.match(releaseWorldEngineSource, /暂无流转中的消息/);
assert.doesNotMatch(releaseWorldEngineSource, /<h3>在途驿报<\/h3>/);
assert.match(releaseWorldEngineSource, /BACKUP_SCRIPT_ID = 'cmyj-world-engine-backup-v1'/);
assert.match(releaseWorldEngineSource, /cmyj_world_engine_backups_v1/);
assert.match(releaseWorldEngineSource, /检测到聊天变量被外部脚本覆盖/);
assert.match(releaseWorldEngineSource, /writeBackupTombstone/);
assert.match(releaseWorldEngineSource, /cwe-event-location-full/);
assert.doesNotMatch(releaseWorldEngineSource, /shortText\(event\.summary/);
assert.doesNotMatch(releaseWorldEngineSource, /shortText\(hook\.summary/);
assert.match(releaseWorldEngineStyle, /\.cwe-event-location-full/);
assert.match(releaseWorldEngineStyle, /-webkit-line-clamp: unset/);
assert.match(releaseWorldEngineStyle, /\.cwe-content-overview\s+\.cwe-ledger-layout\s*\{[^}]*padding-left:\s*0;/s);
assert.match(
  releaseWorldEngineStyle,
  /\.cwe-header\s*>\s*\.cwe-header-actions\s*>\s*\.cwe-close-button\s*\{[^}]*right:\s*-20px;/s,
);
assert.match(
  releaseWorldEngineStyle,
  /\.cwe-command-main\s*>\s*\.cwe-settings-button\s*\{[^}]*grid-column:\s*1\s*\/\s*3;[^}]*grid-row:\s*2;/s,
);
assert.match(
  releaseWorldEngineStyle,
  /\.cwe-command-main\s*>\s*\.cwe-run-button\s*\{[^}]*grid-column:\s*3\s*\/\s*-1;[^}]*grid-row:\s*2;/s,
);
assert.match(releaseWorldEngineSource, /settingsVersion: 4/);
assert.match(releaseWorldEngineSource, /requestTimeoutMs: 90000/);
assert.match(releaseWorldEngineSource, /data-setting="requestTimeoutSeconds"/);
assert.match(releaseWorldEngineSource, /canming-world-engine-banner/);
assert.match(releaseWorldEngineSource, /data-banner-action="cancel"/);
assert.match(releaseWorldEngineSource, /【JSON 兼容输出模式】/);
assert.doesNotMatch(releaseWorldEngineSource, /json_schema:\s*schema/);
assert.match(releaseWorldEngineSource, /turn_facts/);
assert.match(releaseWorldEngineSource, /trace\.discover/);
assert.match(releaseWorldEngineSource, /CURRENT_TURN 不再直接授予人物知识/);
assert.match(releaseWorldEngineSource, /temperature: 1/);
assert.match(releaseWorldEngineSource, /maxTokens: 10000/);
assert.match(releaseWorldEngineSource, /buildPersistentMainModelPacket/);
assert.match(releaseWorldEngineSource, /持续核心状态（未在本轮更新，但仍未结束）/);
assert.match(releaseWorldEngineSource, /knowledge\.grant/);
assert.match(releaseWorldEngineSource, /secret\.reveal/);
assert.match(releaseWorldEngineSource, /秘密与信息盲区登记簿/);
assert.match(releaseWorldEngineSource, /知识采用默认拒绝/);
assert.match(
  releaseWorldEngineStyle,
  /grid-template-rows: minmax\(max-content, 1\.1fr\) minmax\(max-content, 0\.9fr\)/,
);
assert.match(releaseWorldEngineStyle, /\.cwe-content-overview \.cwe-margin-notes footer span/);
assert.match(releaseWorldEngineSource, /cmyj_world_engine_increment_v2/);
assert.match(releaseWorldEngineSource, /buildTransitionFromChanges/);
assert.match(releaseWorldEngineSource, /cmyj_world_changes_v3/);
assert.match(releaseWorldEngineSource, /不是正文审查员、事实摘录器或世界总结器/);
assert.match(releaseWorldEngineSource, /SUPPORTED_OPERATION_TYPES/);
assert.match(releaseWorldEngineSource, /operation\.operation_type/);
assert.match(releaseWorldEngineSource, /operation\.op/);
assert.match(releaseWorldEngineSource, /operation\.operation/);
assert.match(releaseWorldEngineSource, /existingByIdentity/);
assert.match(releaseWorldEngineSource, /hasOperationChangeBeyondIdentity/);
assert.match(releaseWorldEngineSource, /误用于 upsert 的 `set`、`changes`、`patch`|OPERATION_PAYLOAD_KEYS/);
assert.match(releaseWorldEngineSource, /callFactRouter/);
assert.match(releaseWorldEngineSource, /callIsolatedWorldModel/);
assert.match(releaseWorldEngineSource, /事实分流失败，本轮按无新增外传事实继续隔离推演/);
assert.match(releaseWorldEngineSource, /renderParallelWorld/);
assert.match(releaseWorldEngineSource, /createPendingSettlement/);
assert.match(releaseWorldEngineSource, /waitForStableMessage/);
assert.doesNotMatch(releaseWorldEngineSource, /on\(events\.GENERATION_AFTER_COMMANDS/);
assert.doesNotMatch(releaseWorldEngineSource, /setChatMessages/);
assert.match(releaseWorldEngineStyle, /grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)/);
assert.match(releaseWorldEngineStyle, /\.cwe-notice-stack/);
assert.match(releaseWorldEngineStyle, /\.cwe-notice-close/);
assert.doesNotMatch(
  releaseWorldEngineStyle,
  /\.cwe-command-main > \.cwe-tabs\s*\{[^}]*grid-template-columns: repeat\(3,/s,
);
for (const source of [
  releaseLoader,
  releaseWorkshopSource,
  releaseStatusbarSource,
  releaseScenarioSource,
  releaseGeneratorSource,
  releaseWorldEngineSource,
]) {
  assert.doesNotMatch(source, /cm-yj-workshop-staging|canming-workshop-staging|canming-dlc-staging|1\.7-beta/);
  assert.doesNotMatch(source, /测试环境本地/);
}

assert.match(v18Loader, /__CMYJRemoteScriptsV18/);
assert.match(v18LoaderSource, /RUNTIME_REVISION = 2/);
assert.match(v18LoaderSource, /REMOTE_ROOT = 'https:\/\/cmyj-frontend\.pages\.dev\/cmyj-1\.8\/'/);
assert.match(v18StatusbarSource, /STATUSBAR_VERSION = '1\.8\.8'/);
assert.match(v18StatusbarSource, /version: '1\.3\.0'/);
assert.match(v18StatusbarSource, /builtinTongchengWorldbookEntries\(entries\)/);
assert.match(v18StatusbarSource, /conflictMode: 'overwrite'/);
for (const entryName of [
  '桐城及周边概览',
  '桐城本地势力',
  '安庆及周边',
  '周边军事势力',
  '区域经济',
  '[mvu_plot]桐城民变',
  '黄文鼎',
  '汪国华',
]) {
  assert.match(v18StatusbarSource, new RegExp(entryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}
assert.match(v18StatusbarSource, /canming-afterglow-1\.8:statusbar:/);
assert.match(v18StatusbarSource, /__CMYJWorkshopNoticeRuntimeV18/);
assert.doesNotMatch(v18StatusbarSource, /canming-afterglow-statusbar:/);
assert.match(v18GeneratorSource, /canming-1\.8:generator:api/);
assert.doesNotMatch(v18GeneratorSource, /canming-dlc-staging:generator:/);
assert.match(v18GeneratorSource, /deepSeekJsonSchemaPrompt/);
assert.match(v18GeneratorSource, /normalizeApiRequestError/);
assert.match(v18ScenarioSource, /canming-1\.8:scenario-generator:project:v1/);
assert.match(v18ScenarioSource, /canming-1\.8:generator:api/);
assert.match(v18ScenarioSource, /canming-afterglow-1\.8:character-profiles-v1/);
assert.match(v18ScenarioSource, /buildScenarioCharacterCatalog/);
assert.match(v18CharacterCatalogSource, /profiles = \[\]/);
assert.match(v18CharacterCatalogSource, /worldbookEntries = \[\]/);
assert.match(v18ApiCompatSource, /deepSeekJsonSchemaPrompt/);
assert.match(v18WorldEngineSource, /__CMYJWorldEngineV18/);
assert.match(v18WorldEngineSource, /cmyj_world_engine_v18/);
assert.match(v18WorldEngineSource, /canming-world-engine-1\.8:/);
assert.doesNotMatch(v18WorldEngineSource, /canming-world-engine:/);
assert.match(v18WorldEngineSource, /VERSION = '2\.0\.0'/);
assert.match(v18WorldEngineSource, /cmyj_world_engine_backups_v18/);
assert.match(v18WorldEngineSource, /callFactRouter/);
assert.match(v18WorldEngineSource, /incrementalOutputSchema/);
assert.match(v18WorldEngineSource, /KNOWLEDGE_SOURCE_TYPES/);
assert.match(v18WorldEngineSource, /schedulePendingSettlement/);
assert.match(v18WorkshopSource, /canming-workshop-1\.8:publish-v3/);
assert.match(v18WorkshopSource, /canming-workshop-1\.8:installs-v1/);
assert.match(v18WorkshopSource, /https:\/\/cm-yj-workshop\.canming-cloud\.workers\.dev/);
assert.match(v18WorkshopSource, /canming-workshop:token/);
assert.match(v18WorkshopSource, /canming-workshop:user/);
assert.match(v18StatusbarSource, /const WORKSHOP_API = 'https:\/\/cm-yj-workshop\.canming-cloud\.workers\.dev'/);
assert.match(v18StatusbarSource, /const WORKSHOP_TOKEN_KEY = 'canming-workshop:token'/);
assert.doesNotMatch(v18WorkshopSource, /cm-yj-workshop-staging/);
assert.match(v18WorkshopSource, /'worldbook','scenario','generator'/);
assert.match(v18WorkshopSource, /data-collection-scenario-file/);
assert.match(v18WorkshopSource, /collectionScenarioBundle/);
assert.match(v18WorkshopSource, /开场白与初始变量、人物关系、世界书、人物志及角色适配/);
assert.match(v18WorkshopSource, /合集安装时仍遵守一局一身份/);
assert.match(v18WorkshopSource, /showWorkshopSessionExpired/);
assert.match(v18WorkshopSource, /workshopStoredTokenExpired/);
assert.match(v18WorkshopSource, /data-a="session-expired-login"/);
assert.match(v18WorkshopSource, /新的登录凭证有效期为 <b>72 小时<\/b>/);
assert.match(v18WorkshopSource, /r\.status===401&&t&&!path\.startsWith\('\/api\/auth\/'\)/);
assert.match(v18WorkshopSource, /saveInstallSnapshot\(record\.id,snapshot\)/);
assert.match(v18WorkshopSource, /__installOptions=\{enabled:/);
assert.match(v18WorkshopSource, /applyInstalledWorkToCurrentCard/);
assert.match(v18WorkshopSource, /targetCharacterId:after\.characterId/);
assert.match(v18WorkshopSource, /data-apply-install/);
assert.match(v18StatusbarSource, /getCurrentCharacterId/);
assert.match(v18StatusbarSource, /characterId,/);
assert.match(v18StatusbarSource, /scenarioDetails: activeScenarioDetails/);
assert.doesNotMatch(v18WorkshopSource, /选择你的来历/);
assert.match(v18WorkshopSource, /scenario-desk/);
assert.match(v18WorkshopSource, /管理与修复/);
assert.doesNotMatch(v18WorkshopSource, /先领一纸身份/);
assert.match(v18WorkshopSource, /scenario-hub"><section class="scenario-desk/);
assert.match(v18WorkshopSource, /shellWithAlignedScenarioDesk/);
assert.match(v18WorkshopSource, /function textCoverMarkup/);
assert.match(v18WorkshopSource, /text-cover-host/);
assert.match(v18WorkshopSource, /function revealTextCover/);
assert.match(v18WorkshopSource, /detail-text-cover/);
assert.match(v18WorkshopSource, /function workshopAuthOrigin/);
assert.match(v18SchemaSource, /粮秣流水/);
assert.match(v18SchemaSource, /装备编制/);
assert.match(v18SchemaSource, /欠饷月数/);
assert.match(v18SchemaSource, /军令记录/);
assert.match(v18StatusbarSource, /function buildMilitaryCommandQuote/);
assert.match(v18StatusbarSource, /function advanceMilitaryOrders/);
assert.match(v18StatusbarSource, /function appendGrainTransaction/);
assert.doesNotMatch(v18StatusbarSource, /pendingDeletedPaths/);
assert.match(v18StatusbarSource, /data-action="open-military-command"/);
assert.match(v18StatusbarSource, /军府签押/);
assert.match(v18StatusbarSource, /syncActiveDlcRelationshipGraph/);
assert.match(v18StatusbarSource, /ORIGINAL_TONGCHENG_CHARACTER_PROFILES/);
assert.match(v18StatusbarSource, /ORIGINAL_TONGCHENG_CHARACTER_OVERVIEW/);
assert.match(v18StatusbarSource, /ORIGINAL_TONGCHENG_RELATIONSHIP_GRAPH/);
assert.match(v18StatusbarSource, /applyScenarioCharacterProfiles/);
assert.match(v18StatusbarSource, /restoreScenarioCharacterProfiles/);
assert.match(v18StatusbarSource, /characterProfileBackups/);
assert.match(v18StatusbarSource, /version: '1\.3\.0'/);
assert.match(v18StatusbarSource, /自动回滚不完整/);
assert.match(v18StatusbarSource, /refreshDlcLanding/);
assert.match(v18CharacterAdaptationSource, /findCharacterAdaptationEntryIndex/);
assert.ok(v18OriginalProfiles.profiles.length >= 15, '1.8 缺少原版完整人物档案');
assert.ok(v18OriginalOverview.content.includes('<原版人物概览>'), '1.8 缺少原版人物概览模板');
assert.ok(v18OriginalGraph.nodes.length >= 10, '1.8 缺少原版人物关系图');
assert.match(v18StatusbarSource, /WORLD_1634_OVERVIEW/);
assert.match(v18StatusbarSource, /east_asia_1634_provinces/);
assert.match(v18StatusbarSource, /initEChartsDetailMap/);
assert.doesNotMatch(v18StatusbarSource, /WORLD_1629/);

assert.ok(v19Loader.length > 1_000, '1.9 加载器未构建');
assert.match(v19LoaderSource, /REMOTE_ROOT = 'https:\/\/keben11\.github\.io\/CMYJ-Frontend\/cmyj-1\.9\/'/);
assert.match(v19StatusbarSource, /STATUSBAR_VERSION = '1\.10\.2'/);
assert.match(v19StatusbarSource, /MAP_ASSET_ROOT = 'https:\/\/keben11\.github\.io\/CMYJ-Frontend\/assets\/maps'/);
assert.match(v19StatusbarSource, /WORLD_1634_GLOBAL_OVERVIEW/);
assert.match(v19StatusbarSource, /world_1634_global_overview\.js/);
assert.match(v19StatusbarSource, /buildActiveRegionIndex/);
assert.match(v19WorldMapSource, /^var WORLD_1634_GLOBAL_OVERVIEW=/);
assert.match(v19WorldMapSource, /"region_key":"奥斯曼帝国"/);
assert.match(v19WorldMapSource, /"display_name":"英格兰王国"/);
assert.match(v19StatusbarSource, /async function openScenarioWorkshop\(\)/);
assert.match(v19StatusbarSource, /openWorkshop: \(\) => openScenarioWorkshop\(\)/);
assert.match(v19StatusbarSource, /return openCanmingWorkshop\(\{ initialView: 'catalog', initialType: 'scenario' \}\)/);
assert.match(v19StatusbarSource, /下月预估/);
assert.match(v19StatusbarSource, /function hasSettlementSnapshot\(value\)/);
assert.match(v19StatusbarSource, /尚未跨月结算/);
assert.doesNotMatch(v19StatusbarSource, /data-action="manual-settle"/);
assert.doesNotMatch(v19StatusbarSource, /reconcileGrainLedger/);
assert.match(v19SchemaSource, /是否处女: z\.boolean\(\)\.prefault\(true\)/);
assert.match(v19SchemaSource, /同房次数: NonnegativeInteger\.prefault\(0\)/);
assert.match(v19SchemaSource, /在场角色: z/);
assert.match(v19SchemaSource, /粮草状态: z\.enum/);
assert.doesNotMatch(v19SchemaSource, /角色心声:/);
assert.doesNotMatch(v19SchemaSource, /是否在场:/);
assert.doesNotMatch(v19SchemaSource, /掌柜絮语:/);
assert.doesNotMatch(v19SchemaSource, /^\s+粮秣流水:/m);
assert.match(v19SchemaSource, /待收/);
assert.match(v19StatusbarSource, /人际网络\.在场角色/);
assert.doesNotMatch(v19StatusbarSource, /person\.角色心声/);
assert.doesNotMatch(v19StatusbarSource, /person\.是否在场/);
assert.doesNotMatch(v19StatusbarSource, /风月阁\.掌柜絮语/);
assert.match(v19LegacySource, /MIGRATION_VERSION = 8/);
assert.match(v19LegacySource, /function migrateLeanVariables/);
assert.match(v19LegacySource, /failedMessages/);
assert.match(v19SchemaSource, /未决事项/);
assert.match(v19SchemaSource, /当前任务/);
assert.doesNotMatch(v19ScenarioSource, /inner_voice:/);

console.info('1.6 兼容版、1.7 测试版、1.7 正式版、1.8 与 1.9 的加载器、环境隔离及脚本模块均已接入。');
