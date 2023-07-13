require('dotenv').config()

const express = require('express')
const app = express()
const path = require('path');
const cors = require('cors')
const port = process.env.VUE_APP_SEVERPORT || 3001
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
  const url = 'https://bent.baanreserveren.nl/reservations';
  let pass = 0

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true
  });
  
  try {
    const page = await browser.newPage();

    await init(page, browser, url)

    await login(page)

    const { bookedDate } = await selectDate(page, date)

    await selectSport(page)

    const { court: courtFirstBooking, time: timeFirstBooking, isPeak } = await repeatableSections(pass, page, time, people, test)
    const { court: courtSecondBooking, time: timeSecondBooking } = await repeatableSections(pass + 1, page, time, people, test, isPeak)

    returnData.bookedCourt = `Booked Court(s): Court ${courtFirstBooking} ${courtSecondBooking ? ' and court' : ''} ${courtSecondBooking ? courtSecondBooking : ''}`
    returnData.bookedTime = `Booked Time(s): ${timeFirstBooking} ${timeSecondBooking ? 'and' : ''} ${timeSecondBooking ? timeSecondBooking : ''}`
    returnData.bookedDate = `Booked date: ${bookedDate}`
    
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
  // bail when it is second run but we are not in peak time
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