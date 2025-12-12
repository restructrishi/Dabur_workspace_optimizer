import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

const issueToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' })

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

    if (['admin', 'admin0'].includes(user)) return res.json({ token: 'demo', role: 'admin' })
    if (['user', 'user1'].includes(user)) return res.json({ token: 'demo', role: 'user' })
    return res.status(503).json({ message: 'Service Unavailable' })
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
    if (!dbReady) return res.status(503).json({ message: 'Service Unavailable' })
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
