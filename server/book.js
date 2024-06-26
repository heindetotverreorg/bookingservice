const puppeteer = require('puppeteer')
const {
    breakDownCurrentTime,
    convertFormattedDateToTimezonedDate,
    mapReturnData
} = require('./utils')
const {
    init,
    login,
    selectDate,
    selectSport,
    selectCourtTimePeopleAndConfirm
} = require('./crawl-web-page')
const {
    LOGGING,
    URL_TO_CRAWL
} = require('../constants')
const {
    log
} = require('./log')

const bookPadel = async ({ date, time, people, loginName, loginPassword }, test, cron = false) => { 
    if (cron) {
        const { hour, minute, seconds, writtenDay } = breakDownCurrentTime()
        log(LOGGING.START_CRON_JOB, { writtenDay, hour, minute, seconds })
    }

    let responseData
    let pass = 0

    const dateToUse = convertFormattedDateToTimezonedDate(date)
    const browserConfig = {
        headless: process.env.PROD_LIKE ? true : false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        env: {
            DISPLAY: ":10.0"
        }
    }

    const browser = await puppeteer.launch(browserConfig);
    const page = await browser.newPage();
  
    try {
        await init(page, browser, URL_TO_CRAWL)
        await login(page, loginName, loginPassword)
        await selectSport(page)
        await selectDate(page, dateToUse)

        const {
            court: courtFirstBooking,
            time: timeFirstBooking,
            endtime: firstEndtime,
            isPeak
        } = await selectCourtTimePeopleAndConfirm(pass, page, time, people, test)

        await selectDate(page, dateToUse)

        const {
            court: courtSecondBooking,
            time: timeSecondBooking,
            endtime: secondEndTime
        } = await selectCourtTimePeopleAndConfirm(pass + 1, page, time, people, test, isPeak)

        responseData = mapReturnData(
            courtFirstBooking,
            courtSecondBooking,
            timeFirstBooking,
            timeSecondBooking,
            firstEndtime,
            secondEndTime,
            date
        )
    } catch (error) {
        if (browser) {
            await browser.close();
        }
        log(LOGGING.ERROR, error)
        return { error }
    }
    
    if (browser) {
        await browser.close();
    }

    if (cron) {
        console.log(responseData)
    }

    return responseData
}
  
module.exports = {
    bookPadel
}