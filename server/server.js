require('dotenv').config()

const express = require('express')
const app = express()
const path = require('path');
const cors = require('cors')
const port = process.env.VUE_APP_SEVERPORT || 3001

const { bookPadel } = require('./book')
const { startJob, cancelJob, checkJob } = require('./cron')

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

app.post('/book-start-scheduled-booking', async (req, res) => {
    const { date, time, people, test, testDateTime } = req.body
    const data = await startJob(date, time, testDateTime, people, test)
    res.send(data)
})

app.post('/book-stop-scheduled-booking', async (req, res) => {
    const data = await cancelJob()
    res.send(data)
})

app.post('/book-check-scheduled-booking', async (req, res) => {
    const data = await checkJob()
    res.send(data)
})


app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
