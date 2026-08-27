const RUNTIME_KEY = '__CMYJRemoteScriptsV18';
const RUNTIME_REVISION = 2;
const REMOTE_ROOT = 'https://keben11.github.io/CMYJ-Frontend/cmyj-1.9/';

const ROLE_FILES = Object.freeze({
  schema: 'schema',
  legacy: 'legacy',
  workshop: 'workshop',
  statusbar: 'statusbar',
  generator: 'generator',
  'scenario-generator': 'scenario-generator',
  'variable-editor': 'variable-editor',
  timeline: 'timeline',
  'world-engine': 'world-engine',
});

function getHostWindow() {
  try {
    return window.parent && window.parent !== window ? window.parent : window;
  } catch {
    return globalThis;
  }
}

const host = getHostWindow();
const realm = globalThis;
const existingState = realm[RUNTIME_KEY];
const state = existingState?.revision === RUNTIME_REVISION ? existingState : {
  version: '1.9',
  revision: RUNTIME_REVISION,
  promises: Object.create(null),
  loaded: Object.create(null),
};

async function importRole(role) {
  const roleFile = ROLE_FILES[role];
  if (!roleFile) throw new Error(`未知的残明余烬远程脚本：${role}`);

  const roleUrl = `${REMOTE_ROOT}${roleFile}/index.js`;
  await import(/* webpackIgnore: true */ roleUrl);
  state.loaded[role] = true;
  return true;
}

export function boot(role) {
  if (state.loaded[role]) return Promise.resolve(true);
  if (state.promises[role]) return state.promises[role];

  const promise = importRole(role).catch(error => {
    delete state.promises[role];
    console.error(`[残明余烬远程脚本] ${role} 加载失败`, error);
    throw error;
  });
  state.promises[role] = promise;
  return promise;
}

const runtime = Object.assign(state, {
  boot,
  roles: ROLE_FILES,
  baseUrl: REMOTE_ROOT,
});

realm[RUNTIME_KEY] = runtime;
realm.__CMYJRemoteScripts = runtime;
host[RUNTIME_KEY] = runtime;
host.__CMYJRemoteScripts = runtime;
