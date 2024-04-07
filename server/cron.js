const cron = require('node-cron');
const moment = require('moment-timezone');
const { bookPadel } = require('./book')
const {
    breakDownTaskDate,
    dateTimeToCron,
    delay,
    formatToRTFC
} = require('./utils');
const {
    LOGGING
} = require('../constants')
const {
    log
} = require('./log')

let task

const startJob = (crawlPayload, testTimeDate, test) => {
    if (task) {
        cancelJob()
    }

    const {
        date,
        time
    } = crawlPayload

    const bookingDateMinusThreeDays = moment(date).subtract(3, 'days')
    console.log('bookingDateMinusThreeDays', bookingDateMinusThreeDays)
    const rtfcFormattedDate = formatToRTFC(bookingDateMinusThreeDays)
    console.log('rtfcFormattedDate', rtfcFormattedDate)
    let cronExpression = dateTimeToCron(rtfcFormattedDate)
    console.log('cronExpression', cronExpression)

    log(LOGGING.CRON_START)

    if (testTimeDate) {
        cronExpression = dateTimeToCron(testTimeDate)
        console.log('testTimeDate', testTimeDate)
        console.log('testCronExpression', cronExpression)
        log(LOGGING.CRON_TEST, cronExpression)
    }

    task = cron.schedule(cronExpression, async () =>  {
        try {
            await delay(2000)
            await bookPadel(crawlPayload, test, true)
            cancelJob()
        } catch(error) {
            log(LOGGING.ERROR, error)
        }
    }, {
        timezone: 'Europe/Amsterdam'
    });
      
    task.start();

    const message = log(LOGGING.CRON_START_MESSAGE, { cronExpression, date, time })

    return {
        message 
    }
}

const cancelJob = () => {
    let message 
    if (task) {
        task.stop();
        task = null

        message = log(LOGGING.CRON_CANCELLED)
    } else {
        message = log(LOGGING.NO_CRON_JOB)
    }

    return message
}

const checkJob = () => {
    let message 
    if (task) {
        const {
            date,
            hours,
            minutes,
            timezone
        } = breakDownTaskDate(task)

        message = log(LOGGING.CRON_JOB_RUNS_AT, { date, hours, minutes, timezone })
    } else {
        message = log(LOGGING.NO_CRON_JOB)
    }

    return message
}

module.exports = {
    startJob,
    cancelJob,
    checkJob
}