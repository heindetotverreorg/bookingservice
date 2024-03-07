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

const startJob = (date, time, testTimeDate, people, test) => {
    const bookingDateMinusThreeDays = moment(date).subtract(3, 'days')
    const rtfcFormattedDate = formatToRTFC(bookingDateMinusThreeDays)
    let cronExpression = dateTimeToCron(rtfcFormattedDate)

    log(LOGGING.CRON_START)

    if (test) {
        cronExpression = dateTimeToCron(testTimeDate)
        log(LOGGING.CRON_TEST, cronExpression)
    }

    task = cron.schedule(cronExpression, async () =>  {
        const delayValueMs = 2000

        try {
            await delay(delayValueMs)
            await bookPadel(date, time, people, test, true)
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