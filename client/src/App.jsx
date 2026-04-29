import { lazy, Suspense } from 'react';
import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { Trophy, Coins, Hammer, Gamepad2, ShoppingBag, Flame, Search, BookOpen, Megaphone } from 'lucide-react';
import ParticleNest from './components/ParticleNest.jsx';

const BattlePass = lazy(() => import('./pages/BattlePass.jsx'));
const Maps = lazy(() => import('./pages/Maps.jsx'));
const CoinsPage = lazy(() => import('./pages/Coins.jsx'));
const Crafting = lazy(() => import('./pages/Crafting.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const Mythic = lazy(() => import('./pages/Mythic.jsx'));
const PlayerStats = lazy(() => import('./pages/PlayerStats.jsx'));
const Encyclopedia = lazy(() => import('./pages/Encyclopedia.jsx'));
const PatchNotes = lazy(() => import('./pages/PatchNotes.jsx'));

const Loading = () => (
  <div className="flex items-center justify-center py-32">
    <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const navItems = [
  { to: '/battlepass', label: '通行证', icon: Trophy },
  { to: '/shop', label: '商店', icon: ShoppingBag },
  { to: '/mythic', label: '神话级', icon: Flame, mythic: true },
  { to: '/coins', label: '金币比例', icon: Coins },
  { to: '/stats', label: '战绩查询', icon: Search },
  { to: '/encyclopedia', label: '百科', icon: BookOpen },
  { to: '/patch-notes', label: '更新', icon: Megaphone },
  // { to: '/crafting', label: '制造轮换', icon: Hammer }
];

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <ParticleNest />
      <header className="border-b border-white/[0.06] bg-black/50 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 grid place-items-center bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/25">
              <Gamepad2 size={17} />
            </div>
            <div>
              <div className="font-display text-xl leading-none text-white tracking-wide">APEX TOOL</div>
              <div className="text-[10px] text-zinc-500 -mt-px tracking-wider">赛季工具站</div>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, mythic }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  mythic
                    ? `flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold transition-all duration-200 ${isActive ? 'text-red-400 bg-red-500/15 border border-red-500/35 shadow-sm shadow-red-500/20' : 'text-red-400/80 hover:text-red-300 hover:bg-red-500/8 border border-transparent'}`
                    : `flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-white/10 text-white border border-white/15 shadow-sm shadow-red-500/10'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`
                }
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/battlepass" replace />} />
            <Route path="/battlepass" element={<BattlePass />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/coins" element={<CoinsPage />} />
            <Route path="/crafting" element={<Crafting />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/mythic" element={<Mythic />} />
            <Route path="/stats" element={<PlayerStats />} />
            <Route path="/encyclopedia" element={<Encyclopedia />} />
            <Route path="/patch-notes" element={<PatchNotes />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="border-t border-apex-border py-4 text-center text-xs text-zinc-500">
        数据来源:mozambiquehe.re · 本站为非官方工具 · 商标版权归 Respawn / EA 所有
      </footer>
    </div>
  );
}
