const BASE = import.meta.env.VITE_API_BASE || '/api';

async function req(path) {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export const api = {
  maps: () => req('/maps'),
  battlepass: () => req('/battlepass'),
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
};
