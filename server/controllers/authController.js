import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

const issueToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' })

const localUsers = [
  { username: 'admin', role: 'admin' },
  { username: 'admin0', role: 'admin' },
  { username: 'user', role: 'user' },
  { username: 'user1', role: 'user' }
];

export const getAllUsers = async (req, res) => {
  const dbReady = !!req.app.locals.dbReady
  if (dbReady) {
    const users = await User.find({}, 'username role')
    return res.json({ users })
  }
  return res.json({ users: localUsers })
}

export const resetUserPassword = async (req, res) => {
  const { username, newPassword } = req.body
  const dbReady = !!req.app.locals.dbReady
  if (dbReady) {
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await User.updateOne({ username }, { passwordHash })
    return res.json({ successful: true })
  }
  // Demo Mode: Just pretend it worked
  console.log(`Password reset for ${username} to ${newPassword}`);
  return res.json({ successful: true })
}

export const loginUser = async (req, res) => {
  try {
    const { user, pwd } = req.body || {}
    const dbReady = !!req.app.locals.dbReady

    if (dbReady) {
      const u = await User.findOne({ username: user })
      if (!u) return res.status(401).json({ message: 'Unauthorized' })
      const ok = await bcrypt.compare(pwd || '', u.passwordHash)
      if (!ok) return res.status(401).json({ message: 'Unauthorized' })
      const token = issueToken({ username: u.username, role: u.role })
      return res.json({ token, role: u.role })
    }

    // Demo Mode Logic
    if (['admin', 'admin0'].includes(user)) return res.json({ token: 'demo', role: 'admin' })
    // Allow any user in localUsers to login or just fallback to generic success
    return res.json({ token: 'demo', role: 'user' })
  } catch (err) {
    console.error('login error', err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

export const registerUser = async (req, res) => {
  try {
    const { user, pwd } = req.body || {}
    const dbReady = !!req.app.locals.dbReady

    if (!user || !pwd) return res.status(400).json({ message: 'Bad Request' })

    if (!dbReady) {
      console.log('DB not ready, returning demo registration success');
      // Add to local list for Admin Dashboard visibility
      if (!localUsers.find(u => u.username === user)) {
        localUsers.push({ username: user, role: 'user' });
      }
      return res.json({ token: 'demo', role: 'user' })
    }
    const exists = await User.findOne({ username: user })
    if (exists) return res.status(409).json({ message: 'Conflict' })
    const passwordHash = await bcrypt.hash(pwd, 10)
    const u = await User.create({ username: user, passwordHash, role: 'user' })
    const token = issueToken({ username: u.username, role: u.role })
    res.json({ token, role: u.role })
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Conflict' })
    }
    console.error('register error', err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}
