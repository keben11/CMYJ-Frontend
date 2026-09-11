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
  recordPrivateWalletChanges,
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
assert.equal(parsed.经济.资产.旧账.收益核准, undefined);
assert.deepEqual(parsed.经济.皇室公务.余额, {});
assert.deepEqual(Schema.parse(parsed), parsed);
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

assert.equal(data.主角.私库.收支记录['月结-1643-07-租金'].金额, 10);
assert.equal(data.主角.私库.收支记录['月结-1643-07-亏损'].类型, '支出');
assert.deepEqual(Schema.parse(data).主角.私库.收支记录, data.主角.私库.收支记录);
const walletTest = structuredClone(base);
const walletBefore = { ...walletTest.主角.私库.金银铜 };
walletTest.主角.私库.金银铜.白银 -= 4;
recordPrivateWalletChanges(walletTest, walletBefore, '购买', 'purchase');
recordPrivateWalletChanges(walletTest, walletBefore, '购买', 'purchase');
assert.equal(Object.keys(walletTest.主角.私库.收支记录).length, 1);
assert.equal(walletTest.主角.私库.收支记录['purchase-白银两'].金额, 4);
assert.equal(walletTest.主角.私库.收支记录['purchase-白银两'].类型, '支出');
assert.deepEqual(walletTest.经济.国家财政, base.经济.国家财政);
const exchangeBefore = { ...walletTest.主角.私库.金银铜 };
walletTest.主角.私库.金银铜.白银 -= 2;
walletTest.主角.私库.金银铜.铜钱 = 2000;
recordPrivateWalletChanges(walletTest, exchangeBefore, '兑换', 'exchange', true);
assert.equal(walletTest.主角.私库.收支记录['exchange-白银两'].类型, '转出');
assert.equal(walletTest.主角.私库.收支记录['exchange-铜钱文'].类型, '转入');
assert.equal(src.includes("renderPublicAccount('皇室公务"), false);
console.log('PASS separate royal ledger, itemized monthly income/cost, idempotent purchases, exchange transfers, and two-account UI');
