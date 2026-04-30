import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { LogIn, UserPlus, Eye, EyeOff, Gamepad2, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [nickname, setNickname] = useState('');
  const [eaName, setEaName] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const switchMode = (m) => {
    setMode(m);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) return setError('请输入登录账号');
    if (!password) return setError('请输入密码');

    if (mode === 'register') {
      if (password.length < 6) return setError('密码至少需要 6 位');
      if (password !== confirmPwd) return setError('两次输入的密码不一致');
      if (username.trim().length < 3) return setError('账号长度至少 3 个字符');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username.trim(), password);
      } else {
        await register({
          username: username.trim(),
          password,
          nickname: nickname.trim() || undefined,
          eaName: eaName.trim() || undefined,
        });
      }
      navigate(-1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition mb-6"
        >
          <ArrowLeft size={16} /> 返回
        </button>

        {/* Card */}
        <div className="relative border border-white/5 bg-zinc-950/60 shadow-2xl shadow-black/30 backdrop-blur-sm overflow-hidden">
          <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_2px_30px_rgba(0,0,0,0.4)]" />

          {/* Header */}
          <div className="relative z-10 px-8 pt-8 pb-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 grid place-items-center bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/25">
                <Gamepad2 size={20} />
              </div>
              <div>
                <div className="font-display text-xl text-white tracking-wide">APEX TOOL</div>
                <div className="text-[10px] text-zinc-500 tracking-wider">
                  {mode === 'login' ? '登录你的账号' : '创建新账号'}
                </div>
              </div>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-white/5 -mx-8 px-8">
              <button
                onClick={() => switchMode('login')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                  mode === 'login'
                    ? 'text-red-400 border-red-500'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                <LogIn size={15} /> 登录
              </button>
              <button
                onClick={() => switchMode('register')}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                  mode === 'register'
                    ? 'text-red-400 border-red-500'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                <UserPlus size={15} /> 注册
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 px-8 py-6 space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">
                登录账号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="字母、数字、下划线或中文"
                autoComplete="username"
                className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition"
              />
              {mode === 'register' && (
                <p className="text-[10px] text-zinc-600 mt-1">3-20 个字符，注册后不可修改</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">
                密码 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? '至少 6 位' : '输入密码'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  className="w-full px-3 py-2.5 pr-10 bg-zinc-900/80 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Register-only fields */}
            {mode === 'register' && (
              <>
                {/* Confirm password */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    确认密码 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    placeholder="再次输入密码"
                    autoComplete="new-password"
                    className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition"
                  />
                </div>

                {/* Nickname */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">昵称</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    placeholder="不填则默认为登录账号"
                    className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition"
                  />
                </div>

                {/* EA Name */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">
                    Steam 昵称 <span className="text-zinc-600">(选填)</span>
                  </label>
                  <input
                    type="text"
                    value={eaName}
                    onChange={e => setEaName(e.target.value)}
                    placeholder="绑定后可快速查询战绩"
                    className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition"
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">绑定你的 Steam 游戏昵称，方便快速查询战绩</p>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-bold tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <><LogIn size={15} /> 登录</>
              ) : (
                <><UserPlus size={15} /> 注册</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
