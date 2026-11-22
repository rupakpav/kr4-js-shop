const storagePrefix = 'mouseshop.kr4.';
const linkStateKey = 'shop-state';
const sharedStateKeys = ['cart', 'promo', 'favorites', 'theme'];
const isLocalFile = location.protocol === 'file:';
const shopFolder = new URL('.', location.href).href;

function openShopStorage() {
  try {
    const storage = window.localStorage;
    const probe = storagePrefix + 'probe';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

let shopStorage = openShopStorage();
const previousState = history.state?.shopState;
const pageState = previousState || {};

function readJSON(text, fallback) {
  try {
    return text === null ? fallback : JSON.parse(text);
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  if (!shopStorage) return;
  try {
    shopStorage.setItem(storagePrefix + key, JSON.stringify(value));
  } catch {
    shopStorage = null;
  }
}

function useLinkState() {
  return isLocalFile || !shopStorage;
}

function rememberPageState() {
  if (!useLinkState()) return;
  try {
    history.replaceState({ ...history.state, shopState: pageState }, '');
  } catch {
    // Переходы по ссылкам используют состояние текущей страницы.
  }
}

if (useLinkState() && !previousState) {
  const snapshot = readJSON(new URLSearchParams(location.search).get(linkStateKey), null);
  if (snapshot && typeof snapshot === 'object') {
    for (const key of sharedStateKeys) {
      if (!Object.hasOwn(snapshot, key)) continue;
      pageState[key] = snapshot[key];
      saveToStorage(key, snapshot[key]);
    }
    rememberPageState();
  }
}

function readSavedValue(key, fallback) {
  const remembered = Object.hasOwn(pageState, key) ? pageState[key] : fallback;
  if (!shopStorage) return remembered;

  try {
    const raw = shopStorage.getItem(storagePrefix + key);
    const value = readJSON(raw, remembered);
    pageState[key] = value;
    return value;
  } catch {
    shopStorage = null;
    return remembered;
  }
}

function saveValue(key, value) {
  pageState[key] = value;
  saveToStorage(key, value);
  rememberPageState();
}

// При прямом открытии HTML разные файлы могут иметь разные хранилища.
function prepareShopLink(event) {
  if (!useLinkState()) return;
  const link = event.target.closest('a[href]');
  if (!link || link.hasAttribute('download')) return;

  const destination = new URL(link.href);
  if (new URL('.', destination).href !== shopFolder ||
      destination.pathname === location.pathname ||
      !destination.pathname.endsWith('.html')) return;

  const snapshot = {};
  for (const key of sharedStateKeys) {
    const value = readSavedValue(key, undefined);
    if (value !== undefined) snapshot[key] = value;
  }
  destination.searchParams.set(linkStateKey, JSON.stringify(snapshot));
  link.href = destination.href;
}

document.addEventListener('click', prepareShopLink, true);
document.addEventListener('auxclick', prepareShopLink, true);
document.addEventListener('contextmenu', prepareShopLink, true);
window.addEventListener('hashchange', rememberPageState);
