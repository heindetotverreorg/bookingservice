const puppeteer = require('puppeteer')
const moment = require('moment');

const { init, login, selectDate, selectSport, selectCourtAndTime, checkForBookingType, getEndTime, selectPeople, book, parseTimeAndAdd } = require('./crawls')

const bookPadel = async (date, time, people, test, cron = false) => { 
    // reformat date
    date = moment(date).format('MM/DD/YYYY')

    console.log('================================ BOOK =========================')
    if (cron) {
      const week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const day = new Date().getDay()
      const hour = new Date().getHours()
      const minute = new Date().getMinutes()
      const seconds = new Date().getSeconds()
      console.log(`STARTED FROM CRON JOB AT (EXACT RUN TIME): ${week[day]} ${hour}:${minute}:${seconds}`)
    }
    console.log(`PAYLOAD: ${date}, ${time}, ${people}, test is ${test ? 'enabled' : 'disabled'}`)

    const returnData = {}
    const url = 'https://bent.baanreserveren.nl/reservations';
    let pass = 0
  
    const browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === 'production' ? true : false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      env: {
        DISPLAY: ":10.0"
      }
    });
    
    const page = await browser.newPage();

    try {
      await init(page, browser, url)

      await login(page)

      await selectSport(page)

      await selectDate(page, date)

      const {
        court: courtFirstBooking,
        time: timeFirstBooking,
        endtime: firstEndtime,
        isPeak
      } = await selectCourtTimePeopleAndConfirm(pass, page, time, people, test)

      await selectDate(page, date)

      const {
        court: courtSecondBooking,
        time: timeSecondBooking,
        endtime: secondEndTime
      } = await selectCourtTimePeopleAndConfirm(pass + 1, page, time, people, test, isPeak)

      returnData.bookedCourt = `Booked Court(s): Court ${courtFirstBooking} ${courtSecondBooking ? ' and court' : ''} ${courtSecondBooking ? courtSecondBooking : ''}`
      returnData.bookedTime = `Booked Time(s): ${timeFirstBooking} ${timeSecondBooking ? 'and' : ''} ${timeSecondBooking ? timeSecondBooking : ''}`
      returnData.endtime = `End time: ${secondEndTime ? secondEndTime : firstEndtime}`
      returnData.bookedDate = `Booked date: ${date}`

    } catch (error) {
      if (browser) {
        await browser.close();
      }
      
      console.log(error)
      returnData.error = error
    }
    
    if (browser) {
      await browser.close();
    }

    return returnData
  }
  

  const selectCourtTimePeopleAndConfirm = async (pass, page, time, people, test, isPreviousBookingPeak) => {
    if (isPreviousBookingPeak || pass > 1) {
      return {}
    }

    if (pass > 0) {
      time = parseTimeAndAdd(time, true)
    }

    const { court } = await selectCourtAndTime(page, time, pass)
  
    const { isPeak } = await checkForBookingType(page) 

    const { endtime } = await getEndTime(page)
  
    await selectPeople(page, people)
  
    await book(page, test)
  
    return { court, time, endtime, isPeak }
  }

  module.exports = {
    bookPadel
  }