require('dotenv').config()

const express = require('express')
const app = express()
const path = require('path');
const cors = require('cors')
const port = process.env.VUE_APP_SERVERPORT || 3001

const { bookPadel } = require('./book')
const { startJob, cancelJob, checkJob } = require('./cron')
const { isDateMoreThanThreeDaysEarlier } = require('./utils')

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../dist')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.post('/book', async (req, res) => {
    const {
        loginName,
        loginPassword,
        dateToBook: date,
        timeToBook: time,
        people,
        isTestRun: test,
        testDateTime
    } = req.body

    console.log(req.body)

    const data = testDateTime || isDateMoreThanThreeDaysEarlier(date)
        ? await startJob({ date, time, people, loginName, loginPassword }, testDateTime, test)
        : await bookPadel({ date, time, people, loginName, loginPassword }, test)
    res.send(data)
})

app.post('/book-start-scheduled-booking', async (req, res) => {
    const {
        loginName,
        loginPassword,
        dateToBook: date,
        timeToBook: time,
        people,
        isTestRun: test,
        testDateTime
    } = req.body

    console.log(req.body)

    const data = await startJob({ date, time, people, loginName, loginPassword }, testDateTime, test)
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
