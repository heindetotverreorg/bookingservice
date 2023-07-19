const puppeteer = require('puppeteer')

const { init, login, selectDate, selectSport, selectCourt, checkForBookingType, selectLongerTimeSlot, getEndTime, selectPeople, book } = require('./crawls')

const bookPadel = async (date, time, people, test) => {
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
    
    try {
      const page = await browser.newPage();
  
      await init(page, browser, url)
  
      await login(page)

      await selectDate(page, date)

      await selectSport(page)
  
      const {
        court: courtFirstBooking,
        time: timeFirstBooking,
        endtime: firstEndtime,
        isPeak
      } = await repeatableBookingSections(pass, page, time, people, test)

      await selectDate(page, date)

      const {
        court: courtSecondBooking,
        time: timeSecondBooking,
        endtime: secondEndTime
      } = await repeatableBookingSections(pass + 1, page, time, people, test, isPeak)
  
      returnData.bookedCourt = `Booked Court(s): Court ${courtFirstBooking} ${courtSecondBooking ? ' and court' : ''} ${courtSecondBooking ? courtSecondBooking : ''}`
      returnData.bookedTime = `Booked Time(s): ${timeFirstBooking} ${timeSecondBooking ? 'and' : ''} ${timeSecondBooking ? timeSecondBooking : ''}`
      returnData.endtime = `End time: ${secondEndTime ? secondEndTime : firstEndtime}`
      returnData.bookedDate = `Booked date: ${date}`
      
      if (browser) {
        await browser.close();
      }
  
      return returnData
    } catch (error) {
      return error
    }
  }
  
  const parseTimeAndAdd = (time, addOneHour) => {
    const minutesToAdd = 30
    const [ hours, minutes ] = time.split(':')
    if (addOneHour) {
      return `${parseInt(hours) + 1}:${minutes}`
    }
    if (minutes === '00') {
      return `${hours}:${parseInt(minutes + minutesToAdd)}`
    }
    return `${parseInt(hours) + 1}:${parseInt(minutes - minutesToAdd)}`
  }
  
  const repeatableBookingSections = async (pass, page, time, people, test, isPreviousBookingPeak) => {
    if (pass > 1) {
      return {}
    }

    if (pass > 0) {
      if (!isPreviousBookingPeak) {
        time = parseTimeAndAdd(time, true)
      } else {
        time = parseTimeAndAdd(time)
      }
    }
  
    const { court } = await selectCourt(page, time)
  
    const { isPeak } = await checkForBookingType(page) 
  
    if (!isPeak && pass === 0) {
      await selectLongerTimeSlot(page, time)
    }

    const { endtime } = await getEndTime(page)
  
    await selectPeople(page, people)
  
    await book(page, test)
  
    return { court, time, endtime, isPeak }
  }

  module.exports = {
    bookPadel
  }