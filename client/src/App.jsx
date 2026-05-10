import { lazy, Suspense } from 'react';
import { NavLink, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { Trophy, Coins, Hammer, Gamepad2, ShoppingBag, Flame, Search, BookOpen, Megaphone, User, LogIn, Sparkles } from 'lucide-react';
import ParticleNest from './components/ParticleNest.jsx';
import { AuthProvider, useAuth } from './components/AuthContext.jsx';

const BattlePass = lazy(() => import('./pages/BattlePass.jsx'));
const Maps = lazy(() => import('./pages/Maps.jsx'));
const CoinsPage = lazy(() => import('./pages/Coins.jsx'));
const Crafting = lazy(() => import('./pages/Crafting.jsx'));
const Shop = lazy(() => import('./pages/Shop.jsx'));
const Mythic = lazy(() => import('./pages/Mythic.jsx'));
const PlayerStats = lazy(() => import('./pages/PlayerStats.jsx'));
const Encyclopedia = lazy(() => import('./pages/Encyclopedia.jsx'));
const PatchNotes = lazy(() => import('./pages/PatchNotes.jsx'));
const Auth = lazy(() => import('./pages/Auth.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const ApexMBTI = lazy(() => import('./pages/ApexMBTI.jsx'));

const Loading = () => (
  <div className="flex items-center justify-center py-32">
    <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const navLeft = [
  { to: '/battlepass', label: '通行证', icon: Trophy },
  { to: '/shop', label: '商店', icon: ShoppingBag },
  { to: '/mythic', label: '神话级', icon: Flame },
  { to: '/patch-notes', label: '更新', icon: Megaphone },
  { to: '/coins', label: '金币比例', icon: Coins },
];

const navRight = [
  { to: '/encyclopedia', label: '百科', icon: BookOpen },
  { to: '/stats', label: '战绩查询', icon: Search },
  { to: '/mbti', label: '人格测试', icon: Sparkles },
];

function UserButton() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  if (user) {
    return (
      <button
        onClick={() => navigate('/profile')}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all duration-200 text-zinc-400 hover:text-red-400 hover:bg-white/5 border border-transparent ml-1"
        title="个人中心"
      >
        <User size={15} />
        <span className="hidden sm:inline max-w-[80px] truncate">{user.nickname}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => navigate('/auth')}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all duration-200 text-zinc-400 hover:text-red-400 hover:bg-white/5 border border-transparent ml-1"
    >
      <LogIn size={15} />
      <span className="hidden sm:inline">登录</span>
    </button>
  );
}

function AppContent() {
  return (
    <div className="min-h-full flex flex-col">
      <ParticleNest />
      <header className="border-b border-white/[0.06] bg-black/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          {/* Left nav */}
          <nav className="flex items-center flex-1 justify-end">
            {navLeft.map(({ to, label, icon: Icon }, i) => (
              <>
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm shadow-red-500/10'
                      : 'text-zinc-400 hover:text-red-400 hover:bg-white/5'
                  }`
                }
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
              {i < navLeft.length - 1 && <span className="w-px h-4 bg-red-500/40" />}
            </>
            ))}
          </nav>

          {/* Center logo */}
          <NavLink to="/" className="flex items-center gap-2.5 mx-6 shrink-0 group">
            <div className="w-8 h-8 grid place-items-center bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/25">
              <Gamepad2 size={17} />
            </div>
            <div>
              <div className="font-display text-xl leading-none text-white tracking-wide transition-colors duration-200 group-hover:text-red-400">APEX TOOL</div>
              <div className="text-[10px] text-zinc-500 -mt-px tracking-wider transition-colors duration-200 group-hover:text-red-400/70">赛季工具站</div>
            </div>
          </NavLink>

          {/* Right nav */}
          <nav className="flex items-center flex-1">
            {navRight.map(({ to, label, icon: Icon }, i) => (
              <>
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm shadow-red-500/10'
                      : 'text-zinc-400 hover:text-red-400 hover:bg-white/5'
                  }`
                }
              >
                <Icon size={15} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
              {i < navRight.length - 1 && <span className="w-px h-4 bg-red-500/40" />}
              </>
            ))}
            <span className="w-px h-4 bg-red-500/40" />
            <UserButton />
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
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mbti" element={<ApexMBTI />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="border-t border-apex-border py-4 text-center text-xs text-zinc-500">
        <div>数据来源:mozambiquehe.re · 本站为非官方工具 · 商标版权归 Respawn / EA 所有</div>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block transition-colors hover:text-red-400"
        >
          鄂ICP备2026015426号
        </a>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
