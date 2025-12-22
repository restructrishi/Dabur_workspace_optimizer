import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import authRoutes from './routes/authRoutes.js'
import User from './models/User.js'

const app = express()
app.use(express.json())
app.use(cors({ origin: true, credentials: true }))

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/book_a_seat'
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret'

let dbReady = false
await mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 2000 })
  .then(() => { dbReady = true })
  .catch(() => { dbReady = false })

// keep dbReady in sync using connection events
app.locals.dbReady = dbReady
mongoose.connection.on('connected', () => { app.locals.dbReady = true })
mongoose.connection.on('disconnected', () => { app.locals.dbReady = false })
mongoose.connection.on('error', () => { app.locals.dbReady = false })

const reservationSchema = new mongoose.Schema({
  seatid: Number,
  username: String,
  startdate: Date,
  enddate: Date
})
const planSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  seats: [{ id: Number, name: String, x: Number, y: Number }],
  tables: [{ id: Number, name: String, x: Number, y: Number, width: Number, height: Number }]
})

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema)
const Plan = mongoose.models.Plan || mongoose.model('Plan', planSchema)

const seed = async () => {
  if (!dbReady) return
  const count = await User.countDocuments()
  if (count === 0) {
    const adminHash = await bcrypt.hash('admin', 10)
    const userHash = await bcrypt.hash('user', 10)
    await User.create([
      { username: 'admin', passwordHash: adminHash, role: 'admin' },
      { username: 'admin0', passwordHash: adminHash, role: 'admin' },
      { username: 'user1', passwordHash: userHash, role: 'user' },
      { username: 'user', passwordHash: userHash, role: 'user' }
    ])
  }
  const planCount = await Plan.countDocuments()
  if (planCount === 0) {
    await Plan.create({ key: 'default', seats: [], tables: [] })
  }
}
await seed()

app.use('/api', authRoutes)

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend' })
})

app.get('/api/health', (req, res) => {
  res.json({ dbReady: !!req.app.locals.dbReady })
})

app.get('/api/seats', async (req, res) => {
  if (dbReady) {
    const plan = await Plan.findOne({ key: 'default' })
    return res.json({ seats: plan?.seats || [], tables: plan?.tables || [] })
  }
  // Fallback Dummy Data for Offline/Demo Mode
  const dummySeats = [
    { id: 1, name: 'Seat 1', x: 100, y: 100 },
    { id: 2, name: 'Seat 2', x: 200, y: 100 },
    { id: 3, name: 'Seat 3', x: 300, y: 100 },
    { id: 4, name: 'Seat 4', x: 100, y: 200 },
    { id: 5, name: 'Seat 5', x: 200, y: 200 },
    { id: 6, name: 'Seat 6', x: 300, y: 200 },
    { id: 7, name: 'Exec 1', x: 500, y: 150 },
    { id: 8, name: 'Exec 2', x: 500, y: 250 },
  ];
  const dummyTables = [
    { id: 101, name: 'Meeting', x: 600, y: 200, width: 100, height: 100 },
    { id: 102, name: 'Reception', x: 50, y: 50, width: 300, height: 40 },
  ];
  res.json({ seats: dummySeats, tables: dummyTables })
})

app.post('/api/seats', async (req, res) => {
  const { seats = [], tables = [] } = req.body || {}
  if (dbReady) {
    const plan = await Plan.findOneAndUpdate(
      { key: 'default' },
      { $set: { seats, tables } },
      { upsert: true, new: true }
    )
    return res.json({ successful: true, plan })
  }
  res.json({ successful: true })
})

app.get('/api/reservations', async (req, res) => {
  const selSeat = Number(req.query.selSeat)
  if (Number.isNaN(selSeat)) return res.json({ rslt: [] })
  if (dbReady) {
    const rslt = await Reservation.find({ seatid: selSeat }).sort({ startdate: 1 })
    return res.json({ rslt })
  }
  return res.json({ rslt: [] })
})

app.delete('/api/reservations', async (req, res) => {
  const id = req.query.id
  if (!id) return res.status(400).json({ message: 'Bad Request' })
  if (dbReady) {
    await Reservation.deleteOne({ _id: id })
    return res.json({ successful: true })
  }
  res.json({ successful: true })
})

app.post('/api/reservations', async (req, res) => {
  const { seatId, user, interval } = req.body || {}
  if (!seatId || !user || !Array.isArray(interval) || interval.length !== 2) {
    return res.status(400).json({ message: 'Bad Request' })
  }
  const startdate = new Date(interval[0])
  const enddate = new Date(interval[1])
  if (dbReady) {
    const overlaps = await Reservation.find({
      seatid: seatId,
      $or: [
        { startdate: { $lt: enddate }, enddate: { $gt: startdate } },
        { startdate: { $lte: startdate }, enddate: { $gte: enddate } }
      ]
    })
    if (overlaps.length > 0) return res.status(409).json({ successful: false })
    const r = await Reservation.create({ seatid: seatId, username: user, startdate, enddate })
    return res.json({ successful: true, id: r._id })
  }
  res.json({ successful: true })
})

app.put('/api/reservations', async (req, res) => {
  const { id, seatId, user, interval } = req.body || {}
  if (!id || !seatId || !user || !Array.isArray(interval) || interval.length !== 2) {
    return res.status(400).json({ message: 'Bad Request' })
  }
  const startdate = new Date(interval[0])
  const enddate = new Date(interval[1])
  if (dbReady) {
    const overlaps = await Reservation.find({
      _id: { $ne: id },
      seatid: seatId,
      $or: [
        { startdate: { $lt: enddate }, enddate: { $gt: startdate } },
        { startdate: { $lte: startdate }, enddate: { $gte: enddate } }
      ]
    })
    if (overlaps.length > 0) return res.status(409).json({ successful: false })
    await Reservation.updateOne({ _id: id }, { $set: { seatid: seatId, username: user, startdate, enddate } })
    return res.json({ successful: true })
  }
  res.json({ successful: true })
})

app.get('/api/my_reservations', async (req, res) => {
  const id = String(req.query.id || '')
  if (!id) return res.json({ rslt: [] })
  if (dbReady) {
    const rslt = await Reservation.find({ username: id }).sort({ startdate: 1 })
    return res.json({ rslt })
  }
  res.json({ rslt: [] })
})

app.post('/api/cancel', async (req, res) => {
  const ids = req.body?.ids || []
  if (!Array.isArray(ids)) return res.status(400).json({ message: 'Bad Request' })
  if (dbReady) {
    await Reservation.deleteMany({ _id: { $in: ids } })
    return res.json({ successful: true })
  }
  res.json({ successful: true })
})

const PORT = process.env.PORT || 3005
app.listen(PORT, () => { })
