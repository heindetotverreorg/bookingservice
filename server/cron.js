const cron = require('node-cron');
const moment = require('moment');
const momentTimezone = require('moment-timezone');
const { bookPadel } = require('./book')
const { delay } = require('./crawls')
const { formatToRTFC } = require('./utils');
let task

const startJob = (date, time, testTimeDate, people, test) => {
    const usableDate = moment(date).subtract(3, 'days')
    const newDateFormatted = formatToRTFC(usableDate)
    let cronExpression = dateTimeToCron(newDateFormatted)

    // log cron data
    console.log('================================ CRON =========================')

    // log test run
    if (test) {
        cronExpression = dateTimeToCron(testTimeDate)
        console.log(`THIS IS A TEST RUN: CRON VALUE: ${cronExpression}`)
    }

    // create task
    const newTask = cron.schedule(cronExpression, async () =>  {
        // set delay 
        const delayValueMs = 2000

        // print task data
        console.log('STARTING CRON JOB')
        console.log(`timeout ${delayValueMs} milliseconds`)
        try {
            // delay
            await delay(delayValueMs)
            // book
            await bookPadel(date, time, people, test, true)
            // cancel
            cancelJob()
        } catch(error) {
            console.log(error)
        }
    }, {
        timezone: 'Europe/Amsterdam'
    });

    // set task outside of scope to be able to cancel task
    setTask(newTask)
      
    // start the task
    task.start();

    // retun message
    const message = `Scheduled job has started for (${cronToDateTime(cronExpression)}) with booking data: ${date} at ${time}`

    // print return message
    console.log(message)

    return {
        message 
    }
}

const cancelJob = () => {
    let message 
    if (task) {
        task.stop();
        task = null

        message = `Scheduled job has cancelled`
    } else {
        message = `No scheduled job is running to cancel`
    }

    // print return message
    console.log(message)
    return message
}

const checkJob = () => {
    let message 
    if (task) {
       
        const pattern = task?._scheduler?.timeMatcher?.pattern
        const timezone = task?._scheduler?.timeMatcher?.timezone
        const dateFromCron = cronToDateTime(pattern)
        const m = moment(dateFromCron);
        const date = `${m.date()}/${m.month() + 1}`
        const time = `${m.hours()}:${m.minutes()}`
        const [hours, minutes] = time.split(':')

        message = `Scheduled job runs ${date} at ${hours}:${minutes} in timezone ${timezone}`
    } else {
        message = `No scheduled job is running to check`
    }

    // print return message
    console.log(message)
    return message
}

const dateTimeToCron = (dateTime) => {
    const dutchDateTime = momentTimezone(dateTime).tz('Europe/Amsterdam')
    const m = moment(dutchDateTime);
    const cronExpression = `${m.seconds()} ${m.minutes()} ${m.hours()} ${m.date()} ${m.month() + 1} ${m.day()}`;
    return cronExpression;
}

const cronToDateTime = (cronExpression) => {
  const cronArray = cronExpression.split(' ');
  const dateTime = moment()
    .seconds(cronArray[0])
    .minutes(cronArray[1])
    .hours(cronArray[2])
    .date(cronArray[3])
    .month(cronArray[4] - 1)
    .day(cronArray[5]);

  return dateTime.format();
}

const setTask = (newTask) => {
    task = newTask
}



module.exports = {
    startJob,
    cancelJob,
    checkJob
}