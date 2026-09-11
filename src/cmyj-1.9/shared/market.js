// Campaign prices are already denominated in silver; never reconvert them at checkout.
export function marketItems(defaults, market) {
  const configured = Object.entries(market?.商品价格 || {}).filter(([id, row]) =>
    !['__proto__', 'constructor', 'prototype'].includes(id) && row &&
    typeof row.名称 === 'string' && row.名称.trim() &&
    Number.isFinite(row.白银单价) && row.白银单价 > 0,
  );
  if (!configured.length) return defaults;
  return configured.map(([id, row]) => ({
    id, name: row.名称, category: row.分类 || '常用物资', unit: row.单位 || '件',
    basePrice: row.白银单价, monthlyStock: Math.max(0, Math.floor(row.月库存 ?? 100)),
    defaultQty: Math.max(1, Math.floor(row.默认数量 ?? 1)), desc: row.说明 || '',
  }));
}

export function marketCategories(defaults, market) {
  const items = marketItems([], market);
  if (!items.length) return defaults;
  return [...new Set(items.map(item => item.category))].map(category => [category, category]);
}
