(function () {
  const EDITOR_ID = 'canming-variable-editor';
  const STYLE_ID = 'canming-variable-editor-style';
  const RESERVED_ROOTS = new Set(['stat_data']);

  const state = {
    doc: null,
    theme: 'day',
    data: {},
    selectedPath: [],
    expanded: new Set(['']),
    query: '',
    dirty: false,
    undo: null,
    onChanged: null,
    showToast: null,
  };

  function html(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function pathKey(path) {
    return path.map(String).join('\u0001');
  }

  function splitKey(key) {
    return key ? key.split('\u0001') : [];
  }

  function pathLabel(path) {
    return path.length ? path.map(String).join('.') : '根变量';
  }

  function isObject(value) {
    return value !== null && typeof value === 'object';
  }

  function isContainer(value) {
    return Array.isArray(value) || isObject(value);
  }

  function clone(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function getMvu() {
    return globalThis.Mvu ?? window.parent?.Mvu;
  }

  function getByPath(source, path) {
    return path.reduce((current, key) => (current == null ? undefined : current[key]), source);
  }

  function ensureParent(source, path) {
    let current = source;
    for (const key of path) {
      if (!isObject(current[key])) current[key] = {};
      current = current[key];
    }
    return current;
  }

  function setByPath(source, path, value) {
    if (!path.length) {
      state.data = isObject(value) ? value : {};
      return;
    }
    const parent = ensureParent(source, path.slice(0, -1));
    parent[path[path.length - 1]] = value;
  }

  function cleanupEmptyParents(source, path) {
    for (let length = path.length; length > 0; length--) {
      const currentPath = path.slice(0, length);
      const parentPath = currentPath.slice(0, -1);
      const key = currentPath[currentPath.length - 1];
      const current = getByPath(source, currentPath);
      const parent = getByPath(source, parentPath);
      if (!isContainer(current) || Object.keys(current).length > 0) break;
      if (!isObject(parent)) break;
      if (Array.isArray(parent)) parent.splice(Number(key), 1);
      else delete parent[key];
    }
  }

  function deleteByPath(source, path) {
    if (!path.length) return false;
    const parent = getByPath(source, path.slice(0, -1));
    const key = path[path.length - 1];
    if (!isObject(parent) || !Object.prototype.hasOwnProperty.call(parent, key)) return false;
    if (Array.isArray(parent)) parent.splice(Number(key), 1);
    else delete parent[key];
    cleanupEmptyParents(source, path.slice(0, -1));
    return true;
  }

  function countLeaves(value) {
    if (!isContainer(value)) return 1;
    const values = Object.values(value);
    if (!values.length) return 0;
    return values.reduce((sum, child) => sum + countLeaves(child), 0);
  }

  function valueType(value) {
    if (Array.isArray(value)) return '数组';
    if (value === null) return '空值';
    if (typeof value === 'object') return '分支';
    if (typeof value === 'boolean') return '布尔';
    if (typeof value === 'number') return '数字';
    return '文本';
  }

  function readStatData() {
    const mvu = getMvu();
    if (!mvu?.getMvuData) throw new Error('MVU 尚未初始化。');
    const latest = mvu.getMvuData({ type: 'message', message_id: 'latest' }) || {};
    const data = latest.stat_data;
    return data && typeof data === 'object' ? clone(data) : {};
  }

  async function writeStatData() {
    const mvu = getMvu();
    if (!mvu?.getMvuData || !mvu?.replaceMvuData) throw new Error('MVU 尚未初始化，无法写回。');
    const latest = mvu.getMvuData({ type: 'message', message_id: 'latest' }) || {};
    latest.stat_data = clone(state.data);
    await mvu.replaceMvuData(latest, { type: 'message', message_id: 'latest' });
    state.dirty = false;
    if (typeof state.onChanged === 'function') state.onChanged();
  }

  function toast(message, type = 'ok') {
    if (typeof state.showToast === 'function') state.showToast(message, type);
  }

  function refreshData() {
    state.data = readStatData();
    state.selectedPath = [];
    state.expanded = new Set(['']);
    state.dirty = false;
  }

  function ensureStyle(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .cve-mask{position:absolute;inset:0;z-index:20;display:grid;place-items:center;padding:18px;background:rgba(20,12,7,.52);backdrop-filter:blur(3px)}
      .cve-modal{width:min(920px,96%);height:min(680px,90%);display:flex;flex-direction:column;border:1px solid var(--line);border-radius:20px;background:linear-gradient(135deg,var(--paper),var(--paper2));box-shadow:0 22px 70px var(--shadow);overflow:hidden;color:var(--ink)}
      .cve-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:15px 18px;border-bottom:1px solid var(--line)}.cve-title{min-width:0}.cve-title p{margin:0 0 3px;color:var(--accent);font-size:12px;letter-spacing:.22em}.cve-title h2{margin:0;font-size:20px}
      .cve-head-actions,.cve-footer{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.cve-icon,.cve-btn{border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--muted);cursor:pointer;transition:all .15s}.cve-icon{width:32px;height:32px;display:grid;place-items:center;font-size:18px;line-height:1}.cve-icon:hover,.cve-btn:hover{border-color:var(--accent);color:var(--accent)}.cve-btn{padding:7px 12px}.cve-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}.cve-btn.danger{border-color:rgba(180,50,35,.45);color:rgba(180,50,35,.78)}.cve-btn.danger:hover{background:#b84835;color:#fff;border-color:#b84835}.cve-btn:disabled{opacity:.4;pointer-events:none}
      .cve-search{padding:12px 18px;border-bottom:1px solid var(--line);display:flex;gap:10px;align-items:center}.cve-search input{width:100%;border:1px solid var(--line);border-radius:999px;background:var(--card);color:var(--ink);padding:10px 14px;outline:none}.cve-search input:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--glow)}
      .cve-body{min-height:0;flex:1;display:grid;grid-template-columns:minmax(260px,360px) 1fr;gap:0}.cve-tree{border-right:1px solid var(--line);overflow:auto;padding:12px;background:rgba(0,0,0,.025)}.cve-editor{overflow:auto;padding:16px}
      .cve-node{margin:2px 0}.cve-row{width:100%;display:grid;grid-template-columns:24px minmax(0,1fr) auto;align-items:center;gap:6px;border:1px solid transparent;border-radius:12px;background:transparent;color:var(--ink);padding:7px 8px;text-align:left;cursor:pointer}.cve-row:hover{background:var(--card);border-color:var(--line)}.cve-row.active{background:rgba(164,61,45,.10);border-color:var(--accent)}.cve-twist{color:var(--muted);font-size:16px;text-align:center}.cve-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cve-kind{font-size:12px;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:1px 7px;background:rgba(0,0,0,.04)}.cve-children{margin-left:14px;border-left:1px dashed var(--line);padding-left:8px}
      .cve-detail-card{border:1px solid var(--line);border-radius:16px;background:var(--card);padding:14px;box-shadow:0 10px 22px rgba(0,0,0,.06)}.cve-path{color:var(--muted);font-size:12px;line-height:1.7;word-break:break-all}.cve-field{margin-top:12px}.cve-field label{display:block;margin-bottom:6px;color:var(--accent);font-weight:700}.cve-field input,.cve-field textarea,.cve-field select{width:100%;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.08);color:var(--ink);padding:10px 12px;outline:none;font:inherit}.cve-field textarea{min-height:210px;resize:vertical;line-height:1.55;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}.cve-field input:focus,.cve-field textarea:focus,.cve-field select:focus{border-color:var(--accent);box-shadow:0 0 0 2px var(--glow)}
      .cve-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.cve-empty{height:100%;display:grid;place-content:center;text-align:center;color:var(--muted);line-height:1.8}.cve-footer{justify-content:space-between;padding:12px 18px;border-top:1px solid var(--line);color:var(--muted);font-size:12px}.cve-footer-right{display:flex;gap:8px;flex-wrap:wrap}.cve-badge{display:inline-flex;align-items:center;border:1px solid var(--line);border-radius:999px;padding:4px 9px;background:var(--card)}
      @media (max-width:760px){.cve-modal{height:94%;width:98%;border-radius:16px}.cve-body{grid-template-columns:1fr;grid-template-rows:minmax(180px,42%) 1fr}.cve-tree{border-right:0;border-bottom:1px solid var(--line)}.cve-head{align-items:flex-start}.cve-title h2{font-size:18px}}
    `;
    doc.head.appendChild(style);
  }

  function shouldShow(path, key, value) {
    if (String(key).startsWith('_')) return false;
    if (state.data.经济?.分账启用) {
      const fullPath = [...path, key].join('.');
      if (['经济.流水', '经济.皇室公务', '经济.央行准备金', '经济.账务期初', '经济.分账说明', '经济.上次结算'].includes(fullPath)) return false;
      if (path[0] === '经济' && path[1] === '资产' && ['收益核准', '依据'].includes(key)) return false;
    }
    const query = state.query.trim().toLowerCase();
    if (!query) return true;
    const label = pathLabel([...path, key]).toLowerCase();
    if (label.includes(query) || String(key).toLowerCase().includes(query)) return true;
    if (!isContainer(value)) return String(value ?? '').toLowerCase().includes(query);
    return Object.entries(value).some(([childKey, child]) => shouldShow([...path, key], childKey, child));
  }

  function renderTreeNode(key, value, path) {
    const nextPath = [...path, key];
    if (!shouldShow(path, key, value)) return '';
    const keyId = pathKey(nextPath);
    const expanded = Boolean(state.query) || state.expanded.has(keyId);
    const selected = pathKey(state.selectedPath) === keyId;
    const branch = isContainer(value);
    return `
      <div class="cve-node">
        <button class="cve-row${selected ? ' active' : ''}" data-cve-select="${html(keyId)}">
          <span class="cve-twist" data-cve-toggle="${html(keyId)}">${branch ? (expanded ? '⌄' : '›') : ''}</span>
          <span class="cve-name">${html(key)}</span>
          <span class="cve-kind">${html(valueType(value))}</span>
        </button>
        ${branch && expanded ? `<div class="cve-children">${renderTree(value, nextPath)}</div>` : ''}
      </div>`;
  }

  function renderTree(source, path = []) {
    const entries = Object.entries(source || {});
    if (!entries.length) return '<div class="cve-empty">暂无变量</div>';
    return entries.map(([key, value]) => renderTreeNode(key, value, path)).join('');
  }

  function editorValue(value) {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (value === null) return 'null';
    return JSON.stringify(value, null, 2);
  }

  function selectedCanDelete() {
    if (!state.selectedPath.length) return false;
    if (state.selectedPath.length === 1 && RESERVED_ROOTS.has(state.selectedPath[0])) return false;
    return true;
  }

  const FINANCE_PATHS = {
    '资产': ['经济', '资产'],
    '国库余额': ['经济', '国家财政', '余额'],
    '国家收支': ['经济', '国家财政', '收支记录'],
    '皇室余额': ['主角', '私库', '金银铜'],
    '皇室收支': ['主角', '私库', '收支记录'],
  };

  function renderEditor() {
    const value = getByPath(state.data, state.selectedPath);
    if (!state.selectedPath.length) {
      return '<div class="cve-detail-card"><div class="cve-path">根变量</div><div class="cve-actions"><button class="cve-btn" data-cve-add-child>新增根变量</button></div><div class="cve-empty" style="min-height:220px">选择左侧变量开始编辑<br>可直接选中分支后整枝删除</div></div>';
    }
    const type = Array.isArray(value) || (value !== null && typeof value === 'object') ? 'json' : typeof value;
    return `
      <div class="cve-detail-card">
        <div class="cve-path">${html(pathLabel(state.selectedPath))}</div>
        <div class="cve-actions">
          <button class="cve-btn" data-cve-add-child>新增子项</button>
          <button class="cve-btn danger" data-cve-delete ${selectedCanDelete() ? '' : 'disabled'}>删除${isContainer(value) ? '分支' : '变量'}</button>
        </div>
        <div class="cve-field"><label>类型</label><select data-cve-type>${['string', 'number', 'boolean', 'json'].map(item => `<option value="${item}"${type === item ? ' selected' : ''}>${item}</option>`).join('')}</select></div>
        <div class="cve-field"><label>值</label>${type === 'boolean' ? `<select data-cve-value><option value="true"${value === true ? ' selected' : ''}>true</option><option value="false"${value === false ? ' selected' : ''}>false</option></select>` : `<textarea data-cve-value spellcheck="false">${html(editorValue(value))}</textarea>`}</div>
        <div class="cve-actions"><button class="cve-btn primary" data-cve-apply>应用修改</button><button class="cve-btn" data-cve-refresh-selection>重置输入</button></div>
      </div>`;
  }

  function render() {
    const root = state.doc?.getElementById(EDITOR_ID);
    if (!root) return;

    const oldTree = root.querySelector('.cve-tree');
    const oldEditor = root.querySelector('.cve-editor');
    const oldSearch = state.doc.activeElement?.matches?.('[data-cve-search]') ? state.doc.activeElement : null;
    const oldSearchRange = oldSearch ? [oldSearch.selectionStart, oldSearch.selectionEnd] : null;
    const scrollState = {
      treeTop: oldTree?.scrollTop ?? 0,
      treeLeft: oldTree?.scrollLeft ?? 0,
      editorTop: oldEditor?.scrollTop ?? 0,
      editorLeft: oldEditor?.scrollLeft ?? 0,
    };

    root.className = `cve-mask theme-${state.theme}`;
    root.innerHTML = `
      <section class="cve-modal" role="dialog" aria-modal="true" aria-label="变量修改器">
        <header class="cve-head"><div class="cve-title"><p>残明余烬 · MVU</p><h2>变量修改器</h2></div><div class="cve-head-actions"><button class="cve-icon" data-cve-refresh title="刷新">↻</button><button class="cve-icon" data-cve-close title="关闭">×</button></div></header>
        <div class="cve-search"><input data-cve-search value="${html(state.query)}" placeholder="搜索变量名、路径或值"></div>
        <div class="cve-head-actions" style="padding:0 18px 10px">${Object.keys(FINANCE_PATHS).map(label => `<button class="cve-btn" data-cve-finance="${html(label)}">${html(label)}</button>`).join('')}</div>
        <div class="cve-body"><aside class="cve-tree">${renderTree(state.data)}</aside><section class="cve-editor">${renderEditor()}</section></div>
        <footer class="cve-footer"><span class="cve-badge">${state.dirty ? '有未保存修改' : '已同步 latest'}</span><div class="cve-footer-right"><button class="cve-btn" data-cve-undo ${state.undo ? '' : 'disabled'}>撤销删除</button><button class="cve-btn primary" data-cve-save>写回变量</button></div></footer>
      </section>`;

    const newTree = root.querySelector('.cve-tree');
    const newEditor = root.querySelector('.cve-editor');
    if (newTree) {
      newTree.scrollTop = scrollState.treeTop;
      newTree.scrollLeft = scrollState.treeLeft;
    }
    if (newEditor) {
      newEditor.scrollTop = scrollState.editorTop;
      newEditor.scrollLeft = scrollState.editorLeft;
    }
    if (oldSearchRange) {
      const newSearch = root.querySelector('[data-cve-search]');
      newSearch?.focus();
      newSearch?.setSelectionRange(oldSearchRange[0] ?? newSearch.value.length, oldSearchRange[1] ?? newSearch.value.length);
    }
  }

  function parseInput(type, raw) {
    if (type === 'string') return String(raw ?? '');
    if (type === 'number') {
      const value = Number(raw);
      if (!Number.isFinite(value)) throw new Error('数字格式不正确。');
      return value;
    }
    if (type === 'boolean') return raw === true || raw === 'true';
    try { return JSON.parse(raw); } catch (error) { throw new Error(`JSON 格式不正确：${error.message}`); }
  }

  function addChild() {
    const base = state.selectedPath.length ? state.selectedPath : [];
    const parent = getByPath(state.data, base);
    if (!isObject(parent)) return toast('✗ 只有分支变量可以新增子项', 'err');
    const key = prompt('请输入新变量名');
    if (!key) return;
    if (Object.prototype.hasOwnProperty.call(parent, key)) return toast('✗ 同名变量已存在', 'err');
    parent[key] = '';
    state.selectedPath = [...base, key];
    state.expanded.add(pathKey(base));
    state.dirty = true;
    render();
  }

  function deleteSelected() {
    if (!selectedCanDelete()) return;
    const value = getByPath(state.data, state.selectedPath);
    const label = pathLabel(state.selectedPath);
    const message = isContainer(value) ? `确定删除「${label}」整个分支吗？将移除 ${countLeaves(value)} 个子项，并自动清理空父级。` : `确定删除「${label}」吗？删除后会自动清理空父级。`;
    if (!confirm(message)) return;
    state.undo = { path: [...state.selectedPath], dataBefore: clone(state.data) };
    deleteByPath(state.data, state.selectedPath);
    state.selectedPath = [];
    state.dirty = true;
    render();
  }

  function undoDelete() {
    if (!state.undo) return;
    state.data = clone(state.undo.dataBefore);
    state.selectedPath = [...state.undo.path];
    for (let i = 0; i < state.selectedPath.length; i++) state.expanded.add(pathKey(state.selectedPath.slice(0, i)));
    state.undo = null;
    state.dirty = true;
    render();
  }

  function applyEdit() {
    const type = state.doc.querySelector('[data-cve-type]')?.value || 'string';
    const raw = state.doc.querySelector('[data-cve-value]')?.value || '';
    try {
      setByPath(state.data, state.selectedPath, parseInput(type, raw));
      state.dirty = true;
      render();
    } catch (error) {
      toast(`✗ ${error.message}`, 'err');
    }
  }

  async function save() {
    try {
      await writeStatData();
      toast('✓ 变量已写回', 'ok');
      render();
    } catch (error) {
      toast(`✗ 写回失败：${error.message || '未知错误'}`, 'err');
    }
  }

  function canClose() {
    return !state.dirty || confirm('还有未写回的修改，确定关闭变量修改器吗？');
  }

  function close() {
    if (!state.doc || !canClose()) return;
    const root = state.doc.getElementById(EDITOR_ID);
    root?.remove();
    state.doc.removeEventListener('keydown', onKeydown, true);
    state.doc = null;
    state.undo = null;
  }

  function onClick(event) {
    const target = event.target;
    if (target === state.doc.getElementById(EDITOR_ID)) return close();
    if (target.closest('[data-cve-close]')) return close();
    if (target.closest('[data-cve-refresh]')) {
      if (state.dirty && !confirm('刷新会丢弃未写回修改，确定刷新吗？')) return;
      refreshData(); render(); return;
    }
    const finance = target.closest('[data-cve-finance]');
    if (finance) {
      state.selectedPath = [...FINANCE_PATHS[finance.getAttribute('data-cve-finance')]];
      for (let i = 0; i <= state.selectedPath.length; i++) state.expanded.add(pathKey(state.selectedPath.slice(0, i)));
      state.query = ''; render(); return;
    }
    const toggle = target.closest('[data-cve-toggle]');
    if (toggle) {
      event.stopPropagation();
      const key = toggle.getAttribute('data-cve-toggle') || '';
      if (state.expanded.has(key)) state.expanded.delete(key); else state.expanded.add(key);
      render(); return;
    }
    const select = target.closest('[data-cve-select]');
    if (select) { state.selectedPath = splitKey(select.getAttribute('data-cve-select') || ''); render(); return; }
    if (target.closest('[data-cve-add-child]')) return addChild();
    if (target.closest('[data-cve-delete]')) return deleteSelected();
    if (target.closest('[data-cve-apply]')) return applyEdit();
    if (target.closest('[data-cve-refresh-selection]')) return render();
    if (target.closest('[data-cve-undo]')) return undoDelete();
    if (target.closest('[data-cve-save]')) return save();
  }

  function onInput(event) {
    const input = event.target.closest?.('[data-cve-search]');
    if (!input) return;
    state.query = input.value;
    render();
    const next = state.doc.querySelector('[data-cve-search]');
    next?.focus();
    next?.setSelectionRange(next.value.length, next.value.length);
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    }
  }

  function bind(root) {
    root.addEventListener('click', onClick);
    root.addEventListener('input', onInput);
    state.doc.addEventListener('keydown', onKeydown, true);
  }

  function open(options = {}) {
    state.doc = options.mountDocument || document;
    state.theme = options.theme || state.theme || 'day';
    state.onChanged = options.onChanged || null;
    state.showToast = options.showToast || null;
    ensureStyle(state.doc);
    state.doc.removeEventListener('keydown', onKeydown, true);
    state.doc.getElementById(EDITOR_ID)?.remove();
    refreshData();
    const root = state.doc.createElement('div');
    root.id = EDITOR_ID;
    state.doc.body.appendChild(root);
    bind(root);
    render();
    const input = state.doc.querySelector('[data-cve-search]');
    input?.focus();
  }

  function refresh() {
    if (!state.doc) return;
    refreshData();
    render();
  }

  function toggle(options = {}) {
    if (state.doc?.getElementById(EDITOR_ID)) close();
    else open(options);
  }

  globalThis.CanmingVariableEditor = { open, close, toggle, refresh };
  if (window.parent && window.parent !== window) window.parent.CanmingVariableEditor = globalThis.CanmingVariableEditor;
})();
