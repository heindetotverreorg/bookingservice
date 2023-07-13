const express = require('express')
const app = express()
const path = require('path');
const cors = require('cors')
const port = process.env.VUE_APP_SERVERPORT || 3001
const puppeteer = require('puppeteer')
const crawls = require('./crawls')

const { init, login, selectDate, selectSport, selectCourt, checkForBookingType, selectLongerTimeSlot, selectPeople, book } = crawls

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../dist')));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.post('/reserve', async (req, res) => {
  const { date, time, people, test } = req.body
  console.log(`payload: ${date} ${time} ${people} | is test: ${test}`)

  const data = await reservePadel(date, time, people, test)
  res.send(data)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const reservePadel = async (date, time, people, test) => {
  const returnData = {}
  let pass = 0

  const browser = await puppeteer.launch({
    headless: false
  });
  
  try {
    const page = await browser.newPage();

    init(page, browser)

    await page.goto('https://bent.baanreserveren.nl/reservations');

    await login(page)

    const { bookedDate } = await selectDate(page, date)

    await selectSport(page)

    const { court: courtFirstBooking, time: timeFirstBooking, isPeak } = await repeatableSections(pass, page, time, people, test)
    const { court: courtSecondBooking, time: timeSecondBooking } = await repeatableSections(pass + 1, page, time, people, test, isPeak)

    returnData.bookedCourt = `Court 1st booking: ${courtFirstBooking}, 2nd booking: ${courtSecondBooking ? courtSecondBooking : 'one court booked: no peak time'}}`
    returnData.bookedTime = `Time 1st booking: ${timeFirstBooking}, 2nd booking: ${timeSecondBooking ? timeSecondBooking : 'single one hour booking: no peak time'}}`
    returnData.bookedDate = bookedDate
    
    if (browser) {
      await browser.close();
    }

    return returnData
  } catch (error) {
    return error
  }
}

const parseTimeAndAdd = (time, timetoSet = 30) => {
  const [ hours, minutes ] = time.split(':')
  if (minutes === '00') {
    return `${hours}:${parseInt(minutes + timetoSet)}`
  }
  return `${parseInt(hours) + 1}:${parseInt(minutes - timetoSet)}`
}

const repeatableSections = async (pass, page, time, people, test, isPreviousBookingPeak) => {
  // bail when we are not in peak time and we run it second time
  if (pass !== 0 && !isPreviousBookingPeak) {
    return { }
  }

  if (pass > 0) {
    time = parseTimeAndAdd(time)
  }

  const { court } = await selectCourt(page, time)

  const { isPeak } = await checkForBookingType(page) 

  if (!isPeak) {
    await selectLongerTimeSlot(page, time)
  }

  await selectPeople(page, people)

  await book(page, test)

  return { court, time, isPeak }
}