require('dotenv').config()

const express = require('express')
const app = express()
const path = require('path');
const cors = require('cors')
const port = process.env.VUE_APP_SEVERPORT || 3001

const { bookPadel } = require('./book')
const { startJob, cancelJob } = require('./cron')

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../dist')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.post('/book', async (req, res) => {
  const { date, time, people, test } = req.body
  const data = await bookPadel(date, time, people, test)
  res.send(data)
})

app.post('/start-scheduled-booking', async (req, res) => {
  const { date, time, people, test } = req.body
  const data = await startJob(date, time, people, test)
  res.send(data)
})

app.post('/stop-scheduled-booking', async (req, res) => {
  await cancelJob()
  res.send('stopped')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
