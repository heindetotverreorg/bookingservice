const {
    LOGGING
} = require('../../constants')
const {
    cronToDateTime
} = require('../utils');

const log = (message, args) => {
    if (process.env.ENABLE_LOGGING === 'false') { 
        return
    }
    
    if (message === LOGGING.CRON_CANCELLED) {
        const string = `Scheduled job has cancelled`

        console.log(string)

        return string
    }

    if(message === LOGGING.CRON_JOB_START) {
        console.log('STARTING CRON JOB')
        console.log(`timeout ${args} milliseconds`)
    }

    if(message === LOGGING.CRON_START) {
       console.log('================================ CRON =========================')
    }

    if (message === LOGGING.CRON_JOB_RUNS_AT) {
        const string = `Scheduled job runs ${args.date} at ${args.hours}:${args.minutes} in timezone ${args.timezone}`

        console.log(string)

        return string
    }

    if (message === LOGGING.CRON_START_MESSAGE) {
        const string = `Scheduled job has started for (${cronToDateTime(args.cronExpression)}) with booking data: ${args.date} at ${args.time}`

        console.log(string)

        return string
    }

    if (message === LOGGING.CRON_TEST) {
        console.log(`THIS IS A TEST RUN: CRON VALUE: ${args}`)
    }

    if (message === LOGGING.ERROR) {
        console.log(args)
    }

    if (message === LOGGING.NO_CRON_JOB) {
        const string = `No scheduled job is set`

        console.log(string)

        return string
    }

    if (message === LOGGING.START_CRON_JOB) {
        console.log(`STARTED FROM CRON JOB AT (EXACT RUN TIME): ${args.writtenDay} ${args.hour}:${args.minute}:${args.seconds}`)
    }

    if (message === LOGGING.STEP_LOG) {
        console.log(args)
    }
}

module.exports = {
    log
}