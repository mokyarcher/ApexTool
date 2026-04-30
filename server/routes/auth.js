import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const USERS_FILE = join(__dirname, '..', 'data', 'users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'apex-tool-secret-key-change-in-production';
const JWT_EXPIRES = '7d';

function readUsers() {
  if (!existsSync(USERS_FILE)) return [];
  try { return JSON.parse(readFileSync(USERS_FILE, 'utf8')); } catch { return []; }
}

function writeUsers(users) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// Auth middleware
export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: '未登录' });
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname, eaName } = req.body;

    // Validate username
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: '请输入登录账号' });
    }
    const uname = username.trim();
    if (uname.length < 3 || uname.length > 20) {
      return res.status(400).json({ error: '账号长度需要 3-20 个字符' });
    }
    if (!/^[a-zA-Z0-9_\u4e00-\u9fff]+$/.test(uname)) {
      return res.status(400).json({ error: '账号只能包含字母、数字、下划线和中文' });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ error: '密码至少需要 6 位' });
    }
    if (password.length > 50) {
      return res.status(400).json({ error: '密码不能超过 50 位' });
    }

    const users = readUsers();

    // Check duplicate username
    if (users.some(u => u.username.toLowerCase() === uname.toLowerCase())) {
      return res.status(409).json({ error: '该账号已被注册' });
    }

    // Check duplicate Steam name if provided
    const ea = (eaName || '').trim();
    if (ea && users.some(u => u.eaName && u.eaName.toLowerCase() === ea.toLowerCase())) {
      return res.status(409).json({ error: '该 Steam 昵称已被其他账号绑定' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nick = (nickname || '').trim() || uname;

    const user = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      username: uname,
      password: hashedPassword,
      nickname: nick,
      eaName: ea || null,
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeUsers(users);

    const token = signToken(user);
    const { password: _, ...safeUser } = user;
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    console.error('[auth/register]', err);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '请输入账号和密码' });
    }

    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: '账号不存在' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: '密码错误' });
    }

    const token = signToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authMiddleware, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

// PUT /api/auth/profile - Update profile
router.put('/profile', authMiddleware, (req, res) => {
  const { nickname, eaName, boundUid, boundPlatform } = req.body;
  const users = readUsers();
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: '用户不存在' });

  // Check Steam name uniqueness
  const ea = (eaName || '').trim();
  if (ea && users.some((u, i) => i !== idx && u.eaName && u.eaName.toLowerCase() === ea.toLowerCase())) {
    return res.status(409).json({ error: '该 Steam 昵称已被其他账号绑定' });
  }

  if (nickname !== undefined) users[idx].nickname = (nickname || '').trim() || users[idx].username;
  if (eaName !== undefined) users[idx].eaName = ea || null;
  if (boundUid !== undefined) users[idx].boundUid = boundUid || null;
  if (boundPlatform !== undefined) users[idx].boundPlatform = boundPlatform || null;

  writeUsers(users);
  const { password: _, ...safeUser } = users[idx];
  res.json({ user: safeUser });
});

export default router;
