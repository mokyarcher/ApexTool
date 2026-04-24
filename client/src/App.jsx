import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { Map, Trophy, Coins, Hammer, Gamepad2, ShoppingBag } from 'lucide-react';
import BattlePass from './pages/BattlePass.jsx';
import Maps from './pages/Maps.jsx';
import CoinsPage from './pages/Coins.jsx';
import Crafting from './pages/Crafting.jsx';
import Shop from './pages/Shop.jsx';
import Mythic from './pages/Mythic.jsx';

const navItems = [
  { to: '/battlepass', label: '通行证', icon: Trophy },
  { to: '/maps', label: '地图轮换', icon: Map },
  { to: '/shop', label: '商店', icon: ShoppingBag },
  { to: '/coins', label: '金币比例', icon: Coins },
  { to: '/crafting', label: '制造轮换', icon: Hammer }
];

export default function App() {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-apex-border bg-apex-panel/60 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 grid place-items-center rounded-lg bg-apex-red shadow-lg shadow-apex-red/30">
              <Gamepad2 size={20} />
            </div>
            <div>
              <div className="font-display text-2xl leading-none text-white">APEX TOOL</div>
              <div className="text-xs text-zinc-400 -mt-0.5">赛季工具箱</div>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/mythic"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-bold transition ${isActive ? 'text-red-400 bg-red-500/10 border border-red-500/30' : 'text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-transparent'}`
              }
            >
              神话级
            </NavLink>
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                    isActive
                      ? 'bg-apex-red/15 text-white border border-apex-red/40'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/battlepass" replace />} />
          <Route path="/battlepass" element={<BattlePass />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/coins" element={<CoinsPage />} />
          <Route path="/crafting" element={<Crafting />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/mythic" element={<Mythic />} />
        </Routes>
      </main>

      <footer className="border-t border-apex-border py-4 text-center text-xs text-zinc-500">
        数据来源:mozambiquehe.re · 本站为非官方工具 · 商标版权归 Respawn / EA 所有
      </footer>
    </div>
  );
}
