import { Router } from 'express';

const router = Router();

// Apex Coins 官方档位 (美区定价,参考值)
const PACKS = [
  { coins: 1000, bonus: 0, priceUSD: 9.99, priceCNY: 68 },
  { coins: 2000, bonus: 150, priceUSD: 19.99, priceCNY: 138 },
  { coins: 4000, bonus: 350, priceUSD: 39.99, priceCNY: 268 },
  { coins: 6000, bonus: 700, priceUSD: 59.99, priceCNY: 408 },
  { coins: 10000, bonus: 1500, priceUSD: 99.99, priceCNY: 648 }
];

router.get('/', (_req, res) => {
  const enriched = PACKS.map((p) => {
    const total = p.coins + p.bonus;
    return {
      ...p,
      totalCoins: total,
      coinsPerUSD: +(total / p.priceUSD).toFixed(2),
      coinsPerCNY: +(total / p.priceCNY).toFixed(2)
    };
  });
  const best = enriched.reduce((a, b) => (b.coinsPerCNY > a.coinsPerCNY ? b : a));
  res.json({ packs: enriched, bestValue: best.coins });
});

export default router;
