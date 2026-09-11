import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import _ from 'lodash';
import { Schema } from '../src/cmyj-1.9/schema/definition.js';
import {
  financeSeparated,
  assetOwner,
  privateIncomeByCurrency,
  settlePrivateIncome,
} from '../src/cmyj-1.9/shared/finance.js';
const asset = (月入, 币种 = '白银两') => ({ 月入, 币种, 归属: '皇家私人', 收益核准: true, 依据: '产权与净分红凭据' });
const base = {
  主角: { 私库: { 金银铜: { 白银: 100 }, 其他货币: { 大靖元: 30 } } },
  经济: {
    分账启用: true,
    国家财政: { 余额: { 大靖元: 900 } },
    皇室公务: { 余额: {} },
    资产: {
      旧账: { 月入: 999999 },
      国企: { ...asset(99), 归属: '国家' },
      大典: { ...asset(88), 归属: '非收益' },
      未核: { ...asset(77), 收益核准: false },
      无依据: { ...asset(66), 依据: '' },
      租金: asset(10),
      股息: asset(20, '大靖元'),
      亏损: asset(-3),
    },
  },
  军事: { 各营: { 一营: { 人数: 1000, 士气: 50 } } },
};
assert.equal(assetOwner(base.经济.资产.旧账), '待核');
assert.deepEqual({ ...privateIncomeByCurrency(base.经济.资产) }, { 白银两: 7, 大靖元: 20 });
const data = structuredClone(base);
settlePrivateIncome(data, '1643-07');
assert.equal(data.主角.私库.金银铜.白银, 107);
assert.equal(data.主角.私库.其他货币.大靖元, 50);
assert.deepEqual(data.经济.国家财政, base.经济.国家财政);
assert.deepEqual(data.军事, base.军事);
const once = structuredClone(data);
assert.equal(settlePrivateIncome(data, '1643-07'), null);
assert.deepEqual(data, once);
const swipe = structuredClone(base);
settlePrivateIncome(swipe, '1643-07');
assert.deepEqual(swipe, data);
assert.equal(financeSeparated(Schema.parse({})), false);
const parsed = Schema.parse(base);
assert.equal(parsed.经济.资产.旧账.月入, 999999);
assert.equal(parsed.经济.资产.旧账.收益核准, false);
assert.deepEqual(parsed.经济.皇室公务.余额, {});
assert.deepEqual(Schema.parse(parsed), parsed);
const opened = structuredClone(base);
opened.经济.账务期初 = {
  日期: '测试元年七月一日',
  性质: '续玩结转',
  国家财政: { 大靖元: 900 },
  皇家私人: { 白银两: 100, 大靖元: 30 },
  皇室公务: { 大靖元: 0 },
  说明: '仅为测试的期初，不能重复算收入',
};
opened.经济.央行准备金 = { 余额: { 大靖元: 100 } };
const openedParsed = Schema.parse(opened);
assert.deepEqual(openedParsed.经济.账务期初, opened.经济.账务期初);
openedParsed.经济.国家财政.余额.大靖元 += 200 - 75;
assert.equal(openedParsed.经济.国家财政.余额.大靖元, 1025);
assert.equal(openedParsed.经济.账务期初.国家财政.大靖元, 900);
assert.equal(openedParsed.经济.央行准备金.余额.大靖元, 100);
assert.deepEqual(Schema.parse(openedParsed), openedParsed);
assert.equal(Schema.parse({}).经济.账务期初, undefined);
assert.equal(Schema.parse({}).经济.央行准备金, undefined);
const src = fs.readFileSync(new URL('../src/cmyj-1.9/statusbar/index.js', import.meta.url), 'utf8');
const code = src.slice(src.indexOf('function doSettlementInPlace'), src.indexOf('function activeMilitaryOrders'));
const context = vm.createContext({
  _,
  financeSeparated,
  settlePrivateIncome,
  number: (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d),
  extractYearMonth: () => '',
  settleSessionId: 'test',
  ensureObject: (o, k) => o[k] ?? (o[k] = {}),
  estimateArmyMonthlySupply: () => {
    throw Error('must not debit private army costs');
  },
});
vm.runInContext(code, context);
const f = structuredClone(base);
const result = context.doSettlementInPlace({ stat_data: f }, { closeYM: '1643-07' });
assert.equal(result.assetIncome, 7);
assert.equal(result.armyExpense, 0);
assert.equal(f.经济.上次结算.类型, '皇家私人收益跨月结算');
assert.deepEqual(f.军事, base.军事);
assert.deepEqual(f.经济.国家财政, base.经济.国家财政);
assert.equal(context.doSettlementInPlace({ stat_data: f }, { closeYM: '1643-07' }), null);
console.log(
  'PASS finance ownership, currencies, preserved unknown balances, schema idempotence, monthly deduplication, alternate-state isolation, integration and no private army debit',
);
