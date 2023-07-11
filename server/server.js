const express = require('express')
const app = express()
const path = require('path');
const cors = require('cors')
const port = process.env.VUE_APP_SERVERPORT || 3001
const puppeteer = require('puppeteer')
const crawls = require('./crawls')

const { init, login, selectDate, selectSport, selectCourt, selectPeople, book } = crawls

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../dist')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.post('/reserve', async (req, res) => {
  const { date, time, people } = req.body
  console.log(`payload: ${date} ${time} ${people}`)

  const data = await reservePadel(date, time, people)
  res.send(data)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const reservePadel = async (date, time, people) => {
  const returnData = {}
  
  try {
    const browser = await puppeteer.launch({
      headless: false
    });
    const page = await browser.newPage();

    init(page, browser)

    // go to url
    await page.goto('https://bent.baanreserveren.nl/reservations');

    // login
    await login(page)

    // go to correct date
    const { bookedDate } = await selectDate(page, date)

    // select correct sport
    await selectSport(page)

    // select timeslot on court
    const { court } = await selectCourt(page, time)

    // select people
    await selectPeople(page, people)

    // click book
    await book(page)

    // handle result
    returnData.bookedCourt = court
    returnData.bookedTime = time
    returnData.bookedDate = bookedDate
    
    await browser.close();
    return returnData
  } catch (error) {
    return error
  }
}