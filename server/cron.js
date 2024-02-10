const cron = require('node-cron');
const moment = require('moment');
const { bookPadel } = require('./book')
const  { delay } = require('./crawls')


Date.prototype.isValid = function () {
    return this.getTime() === this.getTime();
};  

let task

const setTask = (newTask) => {
    task = newTask
}

const startJob = (date, time, testTimeDate, people, test) => {
    console.log(date)
    if (date.includes('-')) {
        date = date.replaceAll('-', '/')
    }
    date = date.split('/')
    // return to american format
    date = `${date[1]}/${date[0]}/${date[2]}`
    date = moment(date)
    let usableDate = moment(date)
    usableDate = usableDate.subtract(3, 'days')
    console.log('INCOMING DATE: ', date)
    const newDateFormatted = usableDate.format('MM/DD/YYYY')
    console.log('DATE - 3 DAYS AFTER FORMATTING: ', newDateFormatted)
    const cronValue = dateTimeToCron(newDateFormatted)

    console.log('================================ CRON =========================')
    console.log('BOOKING DATE: ', date)
    console.log('3 DAYS BEFORE BOOK DATE: ', newDateFormatted)
    console.log('CRON VALUE (START OF THE JOB): ', dateTimeToCron(newDateFormatted))

    const testCronValue = dateTimeToCron(testTimeDate)

    if (test) {
        console.log(`THIS IS A TEST RUN: CRON VALUE: ${testCronValue}`)
    }

    const cronExpression = test ? testCronValue : cronValue

    const newTask = cron.schedule(cronExpression, async () =>  {
        const delayValueMs = 20000

        console.log('STARTING CRON JOB')
        console.log(`timeout ${delayValueMs} milliseconds`)
        try {
            await delay(delayValueMs)
            await bookPadel(date, time, people, test, true)
            cancelJob()
        } catch(error) {
            console.log(error)
        }
    }, {
        scheduled: true,
        timezone: "Europe/Amsterdam"
    });

    setTask(newTask)
      
    task.start();

    const message = `Scheduled job has started for (${ test ? cronToDateTime(testCronValue) : cronToDateTime(cronValue)}) with booking data: ${date} at ${time}`

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

module.exports = {
    startJob,
    cancelJob,
    checkJob
}