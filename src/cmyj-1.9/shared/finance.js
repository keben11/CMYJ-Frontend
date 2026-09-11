// The opt-in flag preserves older campaigns. Missing ownership never implies private ownership.
export function financeSeparated(data) {
  return data?.经济?.分账启用 === true;
}

export function assetOwner(asset) {
  return ['皇家私人', '国家', '非收益', '待核'].includes(asset?.归属) ? asset.归属 : '待核';
}

export function approvedPrivateAsset(asset) {
  return (
    assetOwner(asset) === '皇家私人' &&
    asset?.收益核准 === true &&
    typeof asset.月入 === 'number' &&
    Number.isFinite(asset.月入) &&
    typeof asset.币种 === 'string' &&
    asset.币种.trim() !== '' &&
    !['__proto__', 'constructor', 'prototype'].includes(asset.币种.trim()) &&
    typeof asset.依据 === 'string' &&
    asset.依据.trim() !== ''
  );
}

export function privateIncomeByCurrency(assets, silverAlias = false) {
  const totals = Object.create(null);
  for (const asset of Object.values(assets || {})) {
    if (!approvedPrivateAsset(asset)) continue;
    const currency = silverAlias && asset.币种.trim() === '大靖元' ? '白银两' : asset.币种.trim();
    totals[currency] = (totals[currency] || 0) + asset.月入;
  }
  return totals;
}

export function settlePrivateIncome(data, month) {
  if (!month || data.经济?._私人收益结算月份 === month) return null;
  const income = privateIncomeByCurrency(data.经济?.资产, data.经济?.大靖元等值白银);
  const applied = Object.create(null);
  data.主角 ??= {};
  data.主角.私库 ??= {};
  const store = data.主角.私库;
  store.金银铜 ??= { 黄金: 0, 白银: 0, 铜钱: 0 };
  store.其他货币 ??= {};
  for (const [currency, amount] of Object.entries(income)) {
    const coinKey = new Map([
      ['白银两', '白银'],
      ['黄金两', '黄金'],
      ['铜钱文', '铜钱'],
    ]).get(currency);
    const wallet = coinKey ? store.金银铜 : store.其他货币;
    const key = coinKey || currency;
    if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
    const old = wallet[key];
    if (old != null && (typeof old !== 'number' || !Number.isFinite(old))) continue;
    wallet[key] = Math.round(((old || 0) + amount) * 1e6) / 1e6;
    applied[currency] = amount;
  }
  store.收支记录 ??= {};
  for (const [name, asset] of Object.entries(data.经济?.资产 || {})) {
    const currency = data.经济?.大靖元等值白银 && asset.币种?.trim() === '大靖元' ? '白银两' : asset.币种?.trim();
    if (!approvedPrivateAsset(asset) || !Object.hasOwn(applied, currency) || !asset.月入) continue;
    const id = '月结-' + month + '-' + name;
    store.收支记录[id] = { 日期: month, 类型: asset.月入 > 0 ? '收入' : '支出', 金额: Math.abs(asset.月入), 币种: currency, 说明: name + '月度净收益（已结算，勿重复收付）' };
  }
  data.经济._私人收益结算月份 = month;
  return applied;
}

// Record wallet deltas without changing balances. Exchanges are transfers, not income.
export function recordPrivateWalletChanges(data, before, description, id, transfer = false) {
  if (!financeSeparated(data)) return;
  const store = data.主角.私库;
  store.收支记录 ??= {};
  for (const [key, currency] of [['黄金', '黄金两'], ['白银', '白银两'], ['铜钱', '铜钱文']]) {
    const delta = Math.round(((store.金银铜[key] || 0) - (before[key] || 0)) * 1e6) / 1e6;
    if (!delta) continue;
    const recordId = id + '-' + currency;
    if (Object.hasOwn(store.收支记录, recordId)) continue;
    store.收支记录[recordId] = {
      日期: data.世界运转?.当前日期 || '',
      类型: transfer ? (delta > 0 ? '转入' : '转出') : (delta > 0 ? '收入' : '支出'),
      金额: Math.abs(delta), 币种: currency, 说明: description + '（状态栏已记账，勿重复收付）',
    };
  }
}
