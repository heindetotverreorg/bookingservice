const cron = require('node-cron');
const moment = require('moment');
const { bookPadel } = require('./book')
const { delay } = require('./crawls')
let task

const startJob = (date, time, testTimeDate, people, test) => {
    // normalize seperator
    if (date.includes('-')) {
        date = date.replaceAll('-', '/')
    }
    // print incoming date to book
    console.log('INCOMING DATE TO BOOK: ', date)
    const usableDate = moment(date).subtract(3, 'days')
    console.log(usableDate)
    const newDateFormatted = usableDate.format('MM/DD/YYYY')
    // print date to run script
    console.log('DATE TO RUN SCRIPT: ', newDateFormatted)
    const cronValue = dateTimeToCron(newDateFormatted)

    // log booking data
    console.log('================================ CRON =========================')
    console.log('BOOKING DATE: ', date)
    console.log('SCRIPT RUN DATE: ', newDateFormatted)
    console.log('SCRIPT RUN DATE IN CRON: ', dateTimeToCron(newDateFormatted))

    // set cron value for testing purposes
    const testCronValue = dateTimeToCron(testTimeDate)

    // log test run
    if (test) {
        console.log(`THIS IS A TEST RUN: CRON VALUE: ${testCronValue}`)
    }

    // set cron expression
    const cronExpression = test ? testCronValue : cronValue

    // create task
    const newTask = cron.schedule(cronExpression, async () =>  {
        // set delay 
        const delayValueMs = 20000

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
        scheduled: true,
        timezone: "Europe/Amsterdam"
    });

    // set task outside of scope to be able to cancel task
    setTask(newTask)
      
    // start the task
    task.start();

    // retun message
    const message = `Scheduled job has started for (${ test ? cronToDateTime(testCronValue) : cronToDateTime(cronValue)}) with booking data: ${date} at ${time}`

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

    console.log(message)
    return message
}

const checkJob = () => {
    let message 
    if (task) {
       
        const pattern = task?._scheduler?.timeMatcher?.pattern
        const timezone = task?._scheduler?.timeMatcher?.timezone
        const dateFromCron = cronToDateTime(pattern)
        const date = new Date(dateFromCron).toDateString();
        const time = new Date(dateFromCron).toLocaleTimeString('nl-NL');
        const [hours, minutes] = time.split(':')

        message = `Scheduled job runs ${date} at ${hours}:${minutes} in timezone ${timezone}`
    } else {
        message = `No scheduled job is running to check`
    }

    console.log(message)
    return message
}

const dateTimeToCron = (dateTime) => {
  const formattedDate = new Date(dateTime)
  const m = moment(formattedDate);
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