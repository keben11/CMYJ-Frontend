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

export function privateIncomeByCurrency(assets) {
  const totals = Object.create(null);
  for (const asset of Object.values(assets || {})) {
    if (!approvedPrivateAsset(asset)) continue;
    const currency = asset.币种.trim();
    totals[currency] = (totals[currency] || 0) + asset.月入;
  }
  return totals;
}

export function settlePrivateIncome(data, month) {
  if (!month || data.经济?._私人收益结算月份 === month) return null;
  const income = privateIncomeByCurrency(data.经济?.资产);
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
    wallet[key] = Math.round(((old || 0) + amount) * 100) / 100;
    applied[currency] = amount;
  }
  data.经济._私人收益结算月份 = month;
  return applied;
}
