const BASE = import.meta.env.VITE_API_BASE || '/api';

function getToken() {
  return localStorage.getItem('apex_token');
}

async function req(path) {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function authReq(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${BASE}${path}`, { ...options, headers });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
  return data;
}

export const api = {
  maps: () => req('/maps'),
  battlepass: (season) => req(season ? `/battlepass?season=${season}` : '/battlepass'),
  bpSeasons: () => req('/battlepass/seasons'),
  coins: () => req('/coins'),
  crafting: () => req('/crafting'),
  shop: () => req('/shop'),
  milestone: () => req('/shop/milestone'),
  premiumShop: () => req('/shop/premium'),
  doubleStrike: () => req('/shop/double-strike'),
  featuredBundle: () => req('/shop/featured-bundle'),
  recolor: () => req('/shop/recolor'),
  exotic: () => req('/shop/exotic'),
  mythic: () => req('/shop/mythic'),
  player: ({ uid, name, platform = 'PC' }) => {
    const params = new URLSearchParams({ platform });
    if (uid) params.set('uid', uid);
    else if (name) params.set('name', name);
    return req(`/player?${params}`);
  },
  playerLookup: ({ name, platform = 'PC' }) =>
    req(`/player/lookup?name=${encodeURIComponent(name)}&platform=${platform}`),
  legends: () => req('/encyclopedia/legends'),
  weapons: () => req('/encyclopedia/weapons'),
  patchNotes: () => req('/patch-notes'),

  // Auth
  register: (data) => authReq('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => authReq('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => authReq('/auth/me'),
  updateProfile: (data) => authReq('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
};
